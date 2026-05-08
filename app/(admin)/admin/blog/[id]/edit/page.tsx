import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import BlogForm from '../../_components/BlogForm'

export const metadata: Metadata = { title: 'Edit Post' }

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const raw = await db.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  })
  if (!raw) notFound()

  // Serialise Prisma types to plain values before passing to Client Component.
  // Date → ISO string, Json → string, relations → plain arrays.
  const post = {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    content: JSON.stringify(raw.content),
    excerpt: raw.excerpt,
    coverImage: raw.coverImage,
    status: raw.status as string,
    publishedAt: raw.publishedAt ? raw.publishedAt.toISOString() : null,
    tags: raw.tags.map((t) => ({ tag: { name: t.tag.name } })),
  }

  return <BlogForm post={post} />
}
