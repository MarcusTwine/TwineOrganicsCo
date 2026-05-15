import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import StockAdjustmentForm from '../_components/StockAdjustmentForm'

export const metadata: Metadata = { title: 'Adjust Stock' }

export default async function StockAdjustmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      stockAdjustments: {
        include: { admin: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  })
  if (!product) notFound()

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{product.category.name}</p>
        </div>
        <Link href="/admin/stock" className="text-sm text-gray-600 hover:underline">← Back to stock</Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Adjustment form */}
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 text-center">
              <p className="text-4xl font-bold text-gray-900">{product.stock}</p>
              <p className="text-sm text-gray-500">units in stock</p>
            </div>
            <StockAdjustmentForm productId={product.id} />
          </div>
        </div>

        {/* Adjustment history */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Adjustment History</h2>
            </div>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Qty</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Reason</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Note</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {product.stockAdjustments.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-400">No adjustments yet.</td></tr>
                ) : product.stockAdjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{new Date(adj.createdAt).toLocaleDateString('en-ZA')}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${adj.type === 'ADD' ? 'bg-cream text-forest' : 'bg-red-100 text-red-700'}`}>
                        {adj.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{adj.quantity}</td>
                    <td className="px-4 py-3 text-gray-600">{adj.reason}</td>
                    <td className="px-4 py-3 text-gray-500">{adj.note ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{adj.admin.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
