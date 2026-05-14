import { randomUUID } from 'crypto'
import { getSettings } from '@/lib/settings'

async function getPeachConfig() {
  const db = await getSettings(['peach_base_url', 'peach_entity_id', 'peach_access_token'])
  return {
    baseUrl: (db.peach_base_url || process.env.PEACH_BASE_URL || '').replace(/\/$/, ''),
    entityId: db.peach_entity_id || process.env.PEACH_ENTITY_ID || '',
    accessToken: db.peach_access_token || process.env.PEACH_ACCESS_TOKEN || '',
  }
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
  const { baseUrl, entityId, accessToken } = await getPeachConfig()

  if (!baseUrl || !entityId || !accessToken) {
    throw new Error('Peach Payments is not configured. Set credentials in Admin → Settings.')
  }

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

  const res = await fetch(`${baseUrl}/v2/checkout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
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
  const { baseUrl, entityId, accessToken } = await getPeachConfig()

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
