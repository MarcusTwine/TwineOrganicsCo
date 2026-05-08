import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { queryPayment, isSuccessCode } from '@/lib/peach'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const text = await req.text()
  const params = new URLSearchParams(text)
  const resourcePath = params.get('resourcePath')

  if (!resourcePath) {
    return new NextResponse(null, { status: 200 })
  }

  // Re-query Peach for authoritative payment result
  let payment: { id: string; result: { code: string; description: string }; merchantTransactionId: string }
  try {
    payment = await queryPayment(resourcePath)
  } catch {
    return new NextResponse(null, { status: 200 })
  }

  const orderId = payment.merchantTransactionId
  if (!orderId) {
    return new NextResponse(null, { status: 200 })
  }

  const order = await db.order.findUnique({ where: { id: orderId } })
  if (!order) {
    return new NextResponse(null, { status: 200 })
  }

  // Idempotency: already processed
  if (order.status === 'PAID' || order.status === 'FAILED') {
    return new NextResponse(null, { status: 200 })
  }

  if (isSuccessCode(payment.result.code)) {
    const orderWithDetails = await db.order.findUnique({
      where: { id: order.id },
      include: {
        items: { include: { product: { select: { name: true } } } },
        user: { select: { name: true, email: true } },
      },
    })

    if (!orderWithDetails) {
      return new NextResponse(null, { status: 200 })
    }

    const stockUpdates = orderWithDetails.items.map((item) =>
      db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      }),
    )

    await db.$transaction([
      db.order.update({ where: { id: order.id }, data: { status: 'PAID' } }),
      ...stockUpdates,
    ])

    // Email is non-fatal — order is already PAID
    try {
      await sendOrderConfirmationEmail(orderWithDetails)
    } catch {
      // Intentionally swallowed: order already committed
    }
  } else {
    try {
      await db.order.update({ where: { id: order.id }, data: { status: 'FAILED' } })
    } catch {
      // Swallow DB errors — still return 200 to prevent Peach retries
    }
  }

  return new NextResponse(null, { status: 200 })
}
