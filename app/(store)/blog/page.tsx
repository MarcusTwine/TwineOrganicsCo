import type { Metadata } from 'next'
import { db } from '@/lib/db'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Blog' }

export default async function BlogPage() {
  const posts = await db.post.findMany({
    where: { status: 'PUBLISHED' },
    include: { author: { select: { name: true } } },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="mb-10 text-3xl font-bold text-gray-900">Blog</h1>

      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet — check back soon.</p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group block rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
              {post.coverImage && (
                <img src={post.coverImage} alt={post.title} className="h-48 w-full object-cover" />
              )}
              <div className="p-6">
                <p className="mb-2 text-xs text-gray-500">
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' }) : ''} · {post.author.name}
                </p>
                <h2 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-green-800">{post.title}</h2>
                <p className="mb-4 text-sm text-gray-600 line-clamp-3">{post.excerpt}</p>
                <span className="text-sm font-medium text-green-700 group-hover:underline">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
