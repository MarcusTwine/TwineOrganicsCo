import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { deleteCategory, createCategory } from './actions'
import CategoryForm from './_components/CategoryForm'

export const metadata: Metadata = { title: 'Categories' }

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: 'asc' },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Categories</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* New category form */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Add Category</h2>
            <CategoryForm action={createCategory} />
          </div>
        </div>

        {/* Category list */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Slug</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Products</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      No categories yet. Add one using the form.
                    </td>
                  </tr>
                ) : categories.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.slug}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{c._count.products}</td>
                    <td className="px-4 py-3 text-right">
                      {c._count.products > 0 ? (
                        <span className="text-xs text-gray-400">In use</span>
                      ) : (
                        <form action={deleteCategory.bind(null, c.id)}>
                          <button
                            type="submit"
                            className="text-sm text-red-600 hover:underline"
                            onClick={(e) => { if (!confirm('Delete this category?')) e.preventDefault() }}
                          >
                            Delete
                          </button>
                        </form>
                      )}
                    </td>
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
