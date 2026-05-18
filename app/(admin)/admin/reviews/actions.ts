'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireAdmin() {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') throw new Error('Forbidden')
}

export async function approveReview(id: string): Promise<void> {
  await requireAdmin()
  await db.review.update({ where: { id }, data: { isApproved: true } })
  revalidatePath('/admin/reviews')
}

export async function rejectReview(id: string): Promise<void> {
  await requireAdmin()
  await db.review.update({ where: { id }, data: { isApproved: false } })
  revalidatePath('/admin/reviews')
}

export async function deleteReview(id: string): Promise<void> {
  await requireAdmin()
  const review = await db.review.findUnique({ where: { id }, select: { product: { select: { slug: true } } } })
  await db.review.delete({ where: { id } })
  revalidatePath('/admin/reviews')
  if (review?.product.slug) revalidatePath(`/products/${review.product.slug}`)
}
