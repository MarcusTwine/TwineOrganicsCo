import { getSettings } from '@/lib/settings'

async function getPeachConfig() {
  const db = await getSettings(['peach_base_url', 'peach_entity_id', 'peach_access_token'])
  return {
    baseUrl: (db.peach_base_url || process.env.PEACH_BASE_URL || '').replace(/\/$/, ''),
    entityId: db.peach_entity_id || process.env.PEACH_ENTITY_ID || '',
    accessToken: db.peach_access_token || process.env.PEACH_ACCESS_TOKEN || '',
  }
}

export async function createCheckout(params: {
  amount: string
  currency: string
  orderId: string
  shopperResultUrl: string
}): Promise<{ checkoutId: string; widgetScriptUrl: string }> {
  const { baseUrl, entityId, accessToken } = await getPeachConfig()

  if (!baseUrl || !entityId || !accessToken) {
    throw new Error('Peach Payments is not configured. Set credentials in Admin → Settings.')
  }

  const body = new URLSearchParams({
    entityId,
    amount: params.amount,
    currency: params.currency,
    paymentType: 'DB',
    merchantTransactionId: params.orderId,
    shopperResultUrl: params.shopperResultUrl,
  })

  const res = await fetch(`${baseUrl}/v1/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`Peach API error: ${res.status} — ${text}`)
  }

  const data = await res.json()

  if (!data.id) {
    throw new Error(
      `Peach checkout creation failed: ${data.result?.description ?? 'unknown error'}`,
    )
  }

  return {
    checkoutId: data.id as string,
    // Widget script URL — embedded on our /checkout/pay page
    widgetScriptUrl: `${baseUrl}/v1/paymentWidgets.js?checkoutId=${data.id}`,
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
