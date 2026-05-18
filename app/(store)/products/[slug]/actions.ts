'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type State = { error: string; success: boolean }

export async function submitReview(
  productId: string,
  slug: string,
  prev: State,
  fd: FormData,
): Promise<State> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'You must be signed in to leave a review.', success: false }

  const userId = session.user.id

  // Verify the user has purchased this product
  const purchased = await db.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
      },
    },
  })
  if (!purchased) {
    return { error: 'You can only review products you have purchased.', success: false }
  }

  // Check they haven't already reviewed it
  const existing = await db.review.findUnique({ where: { productId_userId: { productId, userId } } })
  if (existing) {
    return { error: 'You have already reviewed this product.', success: false }
  }

  const rating = parseInt(fd.get('rating')?.toString() ?? '0', 10)
  if (!rating || rating < 1 || rating > 5) {
    return { error: 'Please select a rating between 1 and 5 stars.', success: false }
  }

  const body = fd.get('body')?.toString().trim() ?? ''
  if (!body || body.length < 10) {
    return { error: 'Please write at least 10 characters in your review.', success: false }
  }

  const title = fd.get('title')?.toString().trim() || null

  await db.review.create({
    data: { productId, userId, rating, title, body, isApproved: false },
  })

  revalidatePath(`/products/${slug}`)
  return { error: '', success: true }
}
