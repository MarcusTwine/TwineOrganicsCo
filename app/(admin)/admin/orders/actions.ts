'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { OrderStatus } from '@/app/generated/prisma/enums'

type State = { error: string; success: boolean }

const VALID_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED']

export async function updateOrderStatus(orderId: string, prev: State, fd: FormData): Promise<State> {
  const session = await auth()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const rawStatus = fd.get('status')?.toString()
  const status = VALID_STATUSES.find((s) => s === rawStatus)
  if (!status) {
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
