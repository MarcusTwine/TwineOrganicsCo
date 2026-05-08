'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

type State = { error: string; success: boolean }

const VALID_STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED']

export async function updateOrderStatus(orderId: string, prev: State, fd: FormData): Promise<State> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const status = fd.get('status')?.toString()
  if (!status || !VALID_STATUSES.includes(status)) {
    return { error: 'A valid status is required', success: false }
  }

  await db.order.update({ where: { id: orderId }, data: { status } })
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
  return { error: '', success: true }
}

export async function addOrderNote(orderId: string, prev: State, fd: FormData): Promise<State> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const body = fd.get('body')?.toString().trim() ?? ''
  if (!body) return { error: 'Note body is required', success: false }

  await db.orderNote.create({
    data: { orderId, authorId: session.user.id!, body },
  })
  revalidatePath(`/admin/orders/${orderId}`)
  return { error: '', success: true }
}
