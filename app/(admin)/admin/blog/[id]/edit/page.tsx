import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import BlogForm from '../../_components/BlogForm'

export const metadata: Metadata = { title: 'Edit Post' }

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await db.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  })
  if (!post) notFound()
  return <BlogForm post={post} />
}
