import Link from 'next/link'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { queryPayment, isSuccessCode } from '@/lib/peach'
import { sendOrderConfirmationEmail, sendFlowEmail } from '@/lib/email'

export const metadata: Metadata = { title: 'Order result' }

interface Props {
  searchParams: Promise<{ orderId?: string; resourcePath?: string }>
}

export default async function CheckoutResultPage({ searchParams }: Props) {
  const { orderId, resourcePath } = await searchParams

  if (!orderId) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-2xl font-semibold text-gray-900">Something went wrong</h1>
          <p className="mb-6 text-gray-600">No order reference found.</p>
          <Link href="/cart" className="text-forest hover:underline">
            Return to cart
          </Link>
        </div>
      </main>
    )
  }

  let order = await db.order.findUnique({ where: { id: orderId } })

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-2xl font-semibold text-gray-900">Order not found</h1>
          <Link href="/products" className="text-forest hover:underline">
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  // If the order is still PENDING and Peach gave us a resourcePath, resolve it now
  if (order.status === 'PENDING' && resourcePath) {
    try {
      const payment = await queryPayment(resourcePath)

      if (isSuccessCode(payment.result?.code ?? '')) {
        const orderWithDetails = await db.order.findUnique({
          where: { id: order.id },
          include: {
            items: { include: { product: { select: { name: true } } } },
            user: { select: { name: true, email: true } },
          },
        })

        if (orderWithDetails) {
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

          order = { ...order, status: 'PAID' }

          try {
            const shortId = orderWithDetails.id.slice(-8).toUpperCase()
            const sent = await sendFlowEmail('ORDER_PAID', {
              email:         orderWithDetails.user.email,
              customer_name: orderWithDetails.user.name,
              order_id:      shortId,
              order_total:   `R${Number(orderWithDetails.total).toFixed(2)}`,
              order_link:    `${process.env.NEXT_PUBLIC_SITE_URL}/account/orders/${orderWithDetails.id}`,
              site_name:     'Twine Organics',
              site_url:      process.env.NEXT_PUBLIC_SITE_URL ?? '',
            })
            if (!sent) await sendOrderConfirmationEmail(orderWithDetails)
          } catch {
            // Non-fatal
          }
        }
      } else {
        await db.order.update({ where: { id: order.id }, data: { status: 'FAILED' } }).catch(() => {})
        order = { ...order, status: 'FAILED' }
      }
    } catch {
      // If Peach query fails, fall through to PENDING state
    }
  }

  if (order.status === 'PAID') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 text-5xl">✓</div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">Your order is confirmed!</h1>
          <p className="mb-2 text-gray-600">
            Order #{order.id.slice(-8).toUpperCase()}
          </p>
          <p className="mb-6 text-sm text-gray-500">
            A confirmation email has been sent to your email address.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/account/orders/${order.id}`}
              className="inline-block rounded-md bg-forest px-6 py-3 font-medium text-white hover:bg-forest"
            >
              View order details
            </Link>
            <Link href="/products" className="text-sm text-gray-600 hover:text-forest">
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    )
  }

  if (order.status === 'FAILED') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 text-5xl">✗</div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">Payment unsuccessful</h1>
          <p className="mb-6 text-gray-600">
            Your payment could not be processed. No charge has been made.
          </p>
          <Link
            href="/checkout"
            className="inline-block rounded-md bg-forest px-6 py-3 font-medium text-white hover:bg-forest"
          >
            Try again
          </Link>
        </div>
      </main>
    )
  }

  // PENDING — resourcePath absent or Peach query failed
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Payment processing…</h1>
        <p className="mb-6 text-gray-600">
          Your payment is being processed. You will receive a confirmation email shortly.
        </p>
        <Link href="/products" className="text-sm text-gray-600 hover:text-forest">
          Continue shopping
        </Link>
      </div>
    </main>
  )
}
