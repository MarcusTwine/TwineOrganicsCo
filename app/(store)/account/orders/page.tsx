import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'My Orders' }

export default async function OrdersPage() {
  const session = await auth()
  if (!session) redirect('/account/login')

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  const statusColour: Record<string, string> = {
    PENDING:   'bg-yellow-100 text-yellow-800',
    PAID:      'bg-blue-100 text-blue-800',
    SHIPPED:   'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-600',
    FAILED:    'bg-red-100 text-red-800',
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/account" className="text-sm text-gray-500 hover:text-green-700">← Account</Link>
        <h1 className="text-2xl font-semibold text-gray-900">My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
          <Link href="/products" className="mt-4 inline-block rounded-md bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    {order.items.map(i => i.product.name).join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColour[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                  </span>
                  <p className="mt-2 font-semibold text-gray-900">R{Number(order.total).toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
