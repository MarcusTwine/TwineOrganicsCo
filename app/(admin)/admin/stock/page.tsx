import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'Stock' }

export default async function AdminStockPage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true, stock: true, isFeatured: true },
    orderBy: { stock: 'asc' },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Stock Levels</h1>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Units in Stock</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Alert</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No products found.</td></tr>
            ) : products.map((p) => (
              <tr key={p.id} className={p.stock <= 5 ? 'bg-red-50' : 'hover:bg-gray-50'}>
                <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{p.stock}</td>
                <td className="px-4 py-3 text-center">
                  {p.stock === 0 && (
                    <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Out of stock</span>
                  )}
                  {p.stock > 0 && p.stock <= 5 && (
                    <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Low stock</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center"><Link href={`/admin/stock/${p.id}`} className="text-blue-600 hover:underline text-sm">Adjust</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
