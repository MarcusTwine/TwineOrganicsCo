import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import OrderStatusForm from '../_components/OrderStatusForm'
import OrderNoteForm from '../_components/OrderNoteForm'

export const metadata: Metadata = { title: 'Order Detail' }

const statusColour: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  PAID:      'bg-blue-100 text-blue-800',
  SHIPPED:   'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
  FAILED:    'bg-red-100 text-red-800',
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
      notes: { include: { author: { select: { name: true } } }, orderBy: { createdAt: 'asc' } },
    },
  })
  if (!order) notFound()

  const address = order.deliveryAddress as Record<string, string> | null

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <Link href="/admin/orders" className="text-sm text-gray-600 hover:underline">← Back to orders</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer + address */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Customer</h2>
            <p className="font-medium text-gray-900">{order.user.name}</p>
            <p className="text-sm text-gray-500">{order.user.email}</p>
            {address && (
              <div className="mt-3 text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-700 mt-2">Delivery address</p>
                {Object.values(address).filter(Boolean).map((v, i) => <p key={i}>{v}</p>)}
              </div>
            )}
            {order.peachPaymentId && (
              <p className="mt-2 text-xs text-gray-400">Peach ID: {order.peachPaymentId}</p>
            )}
          </div>

          {/* Items */}
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Unit</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-gray-900">{item.product.name}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600">R{Number(item.priceAtPurchase).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">R{(item.quantity * Number(item.priceAtPurchase)).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-700">Order total</td>
                  <td className="px-4 py-3 text-right font-bold text-gray-900">R{Number(order.total).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Notes */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Internal Notes</h2>
            {order.notes.length === 0 ? (
              <p className="text-sm text-gray-400">No notes yet.</p>
            ) : (
              <ul className="space-y-3">
                {order.notes.map((note) => (
                  <li key={note.id} className="rounded-md bg-gray-50 p-3 text-sm">
                    <p className="text-gray-800">{note.body}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {note.author.name} · {new Date(note.createdAt).toLocaleDateString('en-ZA')}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <OrderNoteForm orderId={order.id} />
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">Status</h2>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColour[order.status] ?? 'bg-gray-100'}`}>
              {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
            </span>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </div>
          <p className="mt-2 text-xs text-gray-400 px-1">
            Placed {new Date(order.createdAt).toLocaleDateString('en-ZA')}
          </p>
        </div>
      </div>
    </div>
  )
}
