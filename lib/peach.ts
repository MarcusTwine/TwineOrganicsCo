import { randomUUID } from 'crypto'
import { getSettings } from '@/lib/settings'

// In-memory token cache (valid for the lifetime of the Node process)
let _tokenCache: { token: string; expiresAt: number } | null = null

async function getPeachConfig() {
  const db = await getSettings([
    'peach_base_url', 'peach_entity_id',
    'peach_client_id', 'peach_client_secret', 'peach_merchant_id',
  ])
  return {
    baseUrl:      (db.peach_base_url    || process.env.PEACH_BASE_URL    || '').replace(/\/$/, ''),
    entityId:     db.peach_entity_id    || process.env.PEACH_ENTITY_ID    || '',
    clientId:     db.peach_client_id    || process.env.PEACH_CLIENT_ID    || '',
    clientSecret: db.peach_client_secret || process.env.PEACH_CLIENT_SECRET || '',
    merchantId:   db.peach_merchant_id  || process.env.PEACH_MERCHANT_ID  || '',
  }
}

function authServiceUrl(baseUrl: string): string {
  return baseUrl.includes('testsecure')
    ? 'https://sandbox-dashboard.peachpayments.com'
    : 'https://dashboard.peachpayments.com'
}

async function getBearerToken(
  baseUrl: string,
  clientId: string,
  clientSecret: string,
  merchantId: string,
): Promise<string> {
  // Return cached token if it has more than 60 s of life left
  if (_tokenCache && Date.now() < _tokenCache.expiresAt - 60_000) {
    return _tokenCache.token
  }

  const res = await fetch(`${authServiceUrl(baseUrl)}/api/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId, clientSecret, merchantId }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Peach auth error: ${res.status} — ${text}`)
  }

  const data = await res.json()
  const token = data.access_token as string
  const expiresIn: number = data.expires_in ?? 3600
  _tokenCache = { token, expiresAt: Date.now() + expiresIn * 1_000 }
  return token
}

/**
 * Create a V2 hosted checkout session.
 * Returns the redirectUrl to send the customer to Peach's hosted payment page.
 */
export async function createCheckout(params: {
  amount: number   // total in ZAR (e.g. 10.50)
  currency: string
  orderId: string
  shopperResultUrl: string
}): Promise<{ redirectUrl: string; checkoutId: string | null }> {
  const { baseUrl, entityId, clientId, clientSecret, merchantId } = await getPeachConfig()

  if (!baseUrl || !entityId || !clientId || !clientSecret || !merchantId) {
    throw new Error('Peach Payments is not configured. Set credentials in Admin → Settings.')
  }

  const accessToken = await getBearerToken(baseUrl, clientId, clientSecret, merchantId)

  // V2 API expects amount in cents as an integer
  const amountCents = Math.round(params.amount * 100)

  const body = {
    'authentication.entityId': entityId,
    merchantTransactionId: params.orderId,
    amount: amountCents,
    currency: params.currency,
    paymentType: 'DB',
    nonce: randomUUID(),
    shopperResultUrl: params.shopperResultUrl,
    forceDefaultMethod: false,
  }

  const siteOrigin = (process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? '').replace(/\/$/, '')

  const res = await fetch(`${baseUrl}/v2/checkout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(siteOrigin && { Origin: siteOrigin }),
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Peach API error: ${res.status} — ${text}`)
  }

  const data = await res.json()

  if (!data.redirectUrl) {
    throw new Error(
      `Peach checkout creation failed: ${data.result?.description ?? JSON.stringify(data)}`,
    )
  }

  return {
    redirectUrl: data.redirectUrl as string,
    checkoutId: (data.id ?? data.checkoutId ?? null) as string | null,
  }
}

export async function queryPayment(resourcePath: string): Promise<{
  id: string
  result: { code: string; description: string }
  merchantTransactionId: string
}> {
  const { baseUrl, entityId, clientId, clientSecret, merchantId } = await getPeachConfig()
  const accessToken = await getBearerToken(baseUrl, clientId, clientSecret, merchantId)

  const url = `${baseUrl}${resourcePath}?entityId=${entityId}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error(`Peach API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()
  return {
    id: data.id as string,
    result: data.result as { code: string; description: string },
    merchantTransactionId: data.merchantTransactionId as string,
  }
}

export function isSuccessCode(code: string): boolean {
  return /^(000\.000\.|000\.100\.1)/.test(code)
}
