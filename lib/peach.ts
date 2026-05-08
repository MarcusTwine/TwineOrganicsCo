const PEACH_BASE_URL = process.env.PEACH_BASE_URL!
const PEACH_ENTITY_ID = process.env.PEACH_ENTITY_ID!
const PEACH_ACCESS_TOKEN = process.env.PEACH_ACCESS_TOKEN!

export async function createCheckout(params: {
  amount: string
  currency: string
  orderId: string
  shopperResultUrl: string
}): Promise<{ checkoutId: string; redirectUrl: string }> {
  const body = new URLSearchParams({
    entityId: PEACH_ENTITY_ID,
    amount: params.amount,
    currency: params.currency,
    paymentType: 'DB',
    merchantTransactionId: params.orderId,
    shopperResultUrl: params.shopperResultUrl,
  })

  const res = await fetch(`${PEACH_BASE_URL}/v1/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PEACH_ACCESS_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })

  if (!res.ok) {
    throw new Error(`Peach API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()

  if (!data.id) {
    throw new Error(
      `Peach checkout creation failed: ${data.result?.description ?? 'unknown error'}`,
    )
  }

  return {
    checkoutId: data.id as string,
    redirectUrl: `${PEACH_BASE_URL}/v1/paymentWidgets.js?checkoutId=${data.id}`,
  }
}

export async function queryPayment(resourcePath: string): Promise<{
  id: string
  result: { code: string; description: string }
  merchantTransactionId: string
}> {
  const url = `${PEACH_BASE_URL}${resourcePath}?entityId=${PEACH_ENTITY_ID}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${PEACH_ACCESS_TOKEN}`,
    },
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
