import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'Orders' }

const statusColour: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  PAID:      'bg-blue-100 text-blue-800',
  SHIPPED:   'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-cream text-forest',
  CANCELLED: 'bg-gray-100 text-gray-600',
  FAILED:    'bg-red-100 text-red-800',
}

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Orders</h1>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Order</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Total</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Items</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No orders yet.</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-700">#{o.id.slice(-8).toUpperCase()}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{o.user.name}</p>
                  <p className="text-gray-500">{o.user.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {new Date(o.createdAt).toLocaleDateString('en-ZA')}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">R{Number(o.total).toFixed(2)}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColour[o.status] ?? 'bg-gray-100'}`}>
                    {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">{o.items.length}</td>
                <td className="px-4 py-3 text-center"><Link href={`/admin/orders/${o.id}`} className="text-blue-600 hover:underline text-xs">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
