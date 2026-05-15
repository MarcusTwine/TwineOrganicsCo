import type { Metadata } from 'next'
import { db } from '@/lib/db'
import Link from 'next/link'
import DeletePostButton from './_components/DeletePostButton'

export const metadata: Metadata = { title: 'Blog' }

export default async function AdminBlogPage() {
  const posts = await db.post.findMany({
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-md bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest"
        >
          Add post
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Author</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Published</th>
              <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {posts.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No posts yet.</td></tr>
            ) : posts.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{p.title}</td>
                <td className="px-4 py-3 text-gray-600">{p.author.name}</td>
                <td className="px-4 py-3 text-gray-600">
                  {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-ZA') : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === 'PUBLISHED' ? 'bg-cream text-forest' : 'bg-gray-100 text-gray-600'}`}>
                    {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link href={`/admin/blog/${p.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                    <DeletePostButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
