'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

type State = { error: string; success: boolean }

const VALID_TYPES = ['ADD', 'REMOVE']
const VALID_REASONS = ['RESTOCK', 'SALE', 'DAMAGED', 'CORRECTION', 'OTHER']

export async function adjustStock(productId: string, prev: State, fd: FormData): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const type = fd.get('type')?.toString() ?? ''
  const quantity = parseInt(fd.get('quantity')?.toString() ?? '', 10)
  const reason = fd.get('reason')?.toString() ?? ''
  const note = fd.get('note')?.toString().trim() || null

  if (!VALID_TYPES.includes(type)) return { error: 'Invalid adjustment type', success: false }
  if (!quantity || quantity <= 0) return { error: 'Quantity must be a positive integer', success: false }
  if (!VALID_REASONS.includes(reason)) return { error: 'A valid reason is required', success: false }

  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product) return { error: 'Product not found', success: false }

  const newStock = type === 'ADD'
    ? product.stock + quantity
    : Math.max(0, product.stock - quantity)

  await db.product.update({ where: { id: productId }, data: { stock: newStock } })
  await db.stockAdjustment.create({
    data: { productId, adminId: session.user.id!, type, quantity, reason, note },
  })

  revalidatePath('/admin/stock')
  revalidatePath(`/admin/stock/${productId}`)
  return { error: '', success: true }
}
