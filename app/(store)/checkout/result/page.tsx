import Link from 'next/link'
import type { Metadata } from 'next'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'Order result' }

interface Props {
  searchParams: Promise<{ orderId?: string }>
}

export default async function CheckoutResultPage({ searchParams }: Props) {
  const { orderId } = await searchParams

  if (!orderId) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-2xl font-semibold text-gray-900">Something went wrong</h1>
          <p className="mb-6 text-gray-600">No order reference found.</p>
          <Link href="/cart" className="text-green-700 hover:underline">
            Return to cart
          </Link>
        </div>
      </main>
    )
  }

  const order = await db.order.findUnique({ where: { id: orderId } })

  if (!order) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-4 text-2xl font-semibold text-gray-900">Order not found</h1>
          <Link href="/products" className="text-green-700 hover:underline">
            Continue shopping
          </Link>
        </div>
      </main>
    )
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
              className="inline-block rounded-md bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800"
            >
              View order details
            </Link>
            <Link href="/products" className="text-sm text-gray-600 hover:text-green-800">
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
            className="inline-block rounded-md bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800"
          >
            Try again
          </Link>
        </div>
      </main>
    )
  }

  // PENDING — webhook hasn't arrived yet
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Payment processing…</h1>
        <p className="mb-6 text-gray-600">
          Your payment is being processed. You will receive a confirmation email shortly.
        </p>
        <Link href="/products" className="text-sm text-gray-600 hover:text-green-800">
          Continue shopping
        </Link>
      </div>
    </main>
  )
}
