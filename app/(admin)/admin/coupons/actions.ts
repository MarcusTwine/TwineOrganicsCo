'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

type State = { error: string; success: boolean }

export async function createCoupon(prev: State, fd: FormData): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const code = fd.get('code')?.toString().trim().toUpperCase() ?? ''
  if (!code) return { error: 'Code is required', success: false }
  if (!/^[A-Z0-9_-]+$/.test(code)) return { error: 'Code may only contain letters, numbers, hyphens, and underscores', success: false }

  const discountType = fd.get('discountType')?.toString()
  if (discountType !== 'PERCENTAGE' && discountType !== 'FIXED') {
    return { error: 'Invalid discount type', success: false }
  }

  const discountValue = parseFloat(fd.get('discountValue')?.toString() ?? '')
  if (isNaN(discountValue) || discountValue <= 0) {
    return { error: 'Discount value must be greater than zero', success: false }
  }
  if (discountType === 'PERCENTAGE' && discountValue > 100) {
    return { error: 'Percentage discount cannot exceed 100%', success: false }
  }

  const description = fd.get('description')?.toString().trim() || null
  const minOrderRaw = fd.get('minOrderAmount')?.toString().trim()
  const minOrderAmount = minOrderRaw ? parseFloat(minOrderRaw) : null
  const maxUsesRaw = fd.get('maxUses')?.toString().trim()
  const maxUses = maxUsesRaw ? parseInt(maxUsesRaw, 10) : null
  const expiresAtRaw = fd.get('expiresAt')?.toString().trim()
  const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null

  if (minOrderAmount !== null && isNaN(minOrderAmount)) {
    return { error: 'Min order amount must be a number', success: false }
  }
  if (maxUses !== null && (isNaN(maxUses) || maxUses < 1)) {
    return { error: 'Max uses must be a positive number', success: false }
  }

  try {
    await db.coupon.create({
      data: {
        code,
        description,
        discountType,
        discountValue,
        minOrderAmount,
        maxUses,
        expiresAt,
        isActive: true,
      },
    })
  } catch {
    return { error: 'A coupon with that code already exists', success: false }
  }

  revalidatePath('/admin/coupons')
  return { error: '', success: true }
}

export async function toggleCoupon(id: string, isActive: boolean): Promise<void> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return

  await db.coupon.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/coupons')
}

export async function deleteCoupon(id: string): Promise<void> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return

  await db.coupon.delete({ where: { id } })
  revalidatePath('/admin/coupons')
}
