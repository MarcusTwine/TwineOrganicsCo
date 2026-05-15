'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { OrderStatus } from '@/app/generated/prisma/enums'
import { sendFlowEmail } from '@/lib/email'

type State = { error: string; success: boolean }

const VALID_STATUSES: OrderStatus[] = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED']

const STATUS_TRIGGER: Partial<Record<OrderStatus, string>> = {
  SHIPPED:   'ORDER_SHIPPED',
  DELIVERED: 'ORDER_DELIVERED',
  CANCELLED: 'ORDER_CANCELLED',
}

export async function updateOrderStatus(orderId: string, prev: State, fd: FormData): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const rawStatus = fd.get('status')?.toString()
  const status = VALID_STATUSES.find((s) => s === rawStatus)
  if (!status) {
    return { error: 'A valid status is required', success: false }
  }

  await db.order.update({ where: { id: orderId }, data: { status } })

  // Fire flow email for status transitions that have a trigger
  const trigger = STATUS_TRIGGER[status]
  if (trigger) {
    const order = await db.order.findUnique({
      where:   { id: orderId },
      include: { user: { select: { name: true, email: true } } },
    })
    if (order?.user) {
      const shortId = orderId.slice(-8).toUpperCase()
      sendFlowEmail(trigger, {
        email:         order.user.email,
        customer_name: order.user.name,
        order_id:      shortId,
        order_link:    `${process.env.NEXT_PUBLIC_SITE_URL}/account/orders/${orderId}`,
        site_name:     'Twine Organics',
        site_url:      process.env.NEXT_PUBLIC_SITE_URL ?? '',
      }).catch(() => {})
    }
  }

  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath('/admin/orders')
  return { error: '', success: true }
}

export async function addOrderNote(orderId: string, prev: State, fd: FormData): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const body = fd.get('body')?.toString().trim() ?? ''
  if (!body) return { error: 'Note body is required', success: false }

  await db.orderNote.create({
    data: { orderId, authorId: session.user.id!, body },
  })
  revalidatePath(`/admin/orders/${orderId}`)
  return { error: '', success: true }
}
