import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import BlogPostContent from '@/components/store/BlogPostContent'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await db.post.findUnique({ where: { slug, status: 'PUBLISHED' } })
  if (!post) return { title: 'Post not found' }
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params

  const post = await db.post.findUnique({
    where: { slug, status: 'PUBLISHED' },
    include: {
      author: { select: { name: true } },
      tags: { include: { tag: true } },
    },
  })

  if (!post) notFound()

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/blog" className="hover:text-green-800">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{post.title}</span>
      </nav>

      {post.coverImage && (
        <div className="relative mb-8 h-64 overflow-hidden rounded-xl bg-gray-100 sm:h-80">
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority />
        </div>
      )}

      <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">{post.title}</h1>

      <div className="mb-8 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        <span>By {post.author.name}</span>
        {post.publishedAt && (
          <>
            <span>·</span>
            <time dateTime={post.publishedAt.toISOString()}>
              {new Date(post.publishedAt).toLocaleDateString('en-ZA', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          </>
        )}
        {post.tags.length > 0 && (
          <>
            <span>·</span>
            <div className="flex flex-wrap gap-1">
              {post.tags.map((t) => (
                <span key={t.tag.id} className="rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                  {t.tag.name}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <BlogPostContent content={post.content as object} />

      <div className="mt-12 border-t border-gray-200 pt-6">
        <Link href="/blog" className="text-sm font-medium text-green-700 hover:underline">
          ← Back to blog
        </Link>
      </div>
    </main>
  )
}
