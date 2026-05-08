'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type State = { error: string; success: boolean }

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function createPost(prev: State, fd: FormData): Promise<State> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const title = fd.get('title')?.toString().trim() ?? ''
  const rawContent = fd.get('content')?.toString() ?? ''
  const excerpt = fd.get('excerpt')?.toString() ?? ''
  const coverImage = fd.get('coverImage')?.toString() ?? ''
  const status = fd.get('status')?.toString() === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'
  const rawSlug = fd.get('slug')?.toString().trim()
  const slug = rawSlug || slugify(title)
  const tags: string[] = JSON.parse(fd.get('tags')?.toString() ?? '[]')

  if (!title) return { error: 'Title is required', success: false }

  let content: object
  try {
    content = JSON.parse(rawContent)
  } catch {
    content = { type: 'doc', content: [] }
  }

  try {
    const tagRecords = await Promise.all(
      tags.map((tag) =>
        db.postTag.upsert({
          where: { slug: slugify(tag) },
          create: { name: tag, slug: slugify(tag) },
          update: {},
        })
      )
    )

    await db.post.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        authorId: session.user.id!,
        tags: { create: tagRecords.map((t) => ({ tagId: t.id })) },
      },
    })
  } catch {
    return { error: 'Failed to create post', success: false }
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  redirect('/admin/blog')
  return { error: '', success: true }
}

export async function updatePost(id: string, prev: State, fd: FormData): Promise<State> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const title = fd.get('title')?.toString().trim() ?? ''
  const rawContent = fd.get('content')?.toString() ?? ''
  const excerpt = fd.get('excerpt')?.toString() ?? ''
  const coverImage = fd.get('coverImage')?.toString() ?? ''
  const status = fd.get('status')?.toString() === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT'
  const rawSlug = fd.get('slug')?.toString().trim()
  const slug = rawSlug || slugify(title)
  const tags: string[] = JSON.parse(fd.get('tags')?.toString() ?? '[]')
  const wasPublishedAt = fd.get('existingPublishedAt')?.toString()

  if (!title) return { error: 'Title is required', success: false }

  let content: object
  try {
    content = JSON.parse(rawContent)
  } catch {
    content = { type: 'doc', content: [] }
  }

  const publishedAt =
    status === 'PUBLISHED'
      ? wasPublishedAt ? new Date(wasPublishedAt) : new Date()
      : null

  try {
    const tagRecords = await Promise.all(
      tags.map((tag) =>
        db.postTag.upsert({
          where: { slug: slugify(tag) },
          create: { name: tag, slug: slugify(tag) },
          update: {},
        })
      )
    )

    await db.post.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        coverImage: coverImage || null,
        status,
        publishedAt,
        tags: {
          deleteMany: {},
          create: tagRecords.map((t) => ({ tagId: t.id })),
        },
      },
    })
  } catch {
    return { error: 'Failed to update post', success: false }
  }

  revalidatePath('/admin/blog')
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  redirect('/admin/blog')
}

export async function deletePost(id: string): Promise<void> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return

  await db.post.delete({ where: { id } })
  revalidatePath('/admin/blog')
  revalidatePath('/blog')
}
