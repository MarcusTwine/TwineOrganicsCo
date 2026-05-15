'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { FlowTrigger } from '@/app/generated/prisma/enums'

type State = { error: string; success: boolean }

// ─── Templates ───────────────────────────────────────────────────────────────

export async function createTemplate(prev: State, fd: FormData): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const name    = fd.get('name')?.toString().trim() ?? ''
  const subject = fd.get('subject')?.toString().trim() ?? ''
  const body    = fd.get('body')?.toString() ?? ''

  if (!name || !subject || !body) return { error: 'Name, subject, and body are required', success: false }

  await db.emailTemplate.create({ data: { name, subject, body } })
  revalidatePath('/admin/flows')
  return { error: '', success: true }
}

export async function updateTemplate(id: string, prev: State, fd: FormData): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const name    = fd.get('name')?.toString().trim() ?? ''
  const subject = fd.get('subject')?.toString().trim() ?? ''
  const body    = fd.get('body')?.toString() ?? ''

  if (!name || !subject || !body) return { error: 'Name, subject, and body are required', success: false }

  await db.emailTemplate.update({ where: { id }, data: { name, subject, body } })
  revalidatePath('/admin/flows')
  return { error: '', success: true }
}

export async function deleteTemplate(id: string): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  await db.emailTemplate.delete({ where: { id } })
  revalidatePath('/admin/flows')
  return { error: '', success: true }
}

// ─── Flows ───────────────────────────────────────────────────────────────────

export async function upsertFlow(trigger: FlowTrigger, prev: State, fd: FormData): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const templateId = fd.get('templateId')?.toString() ?? ''
  const isActive   = fd.get('isActive') === 'true'

  if (!templateId) return { error: 'Please select a template', success: false }

  await db.emailFlow.upsert({
    where:  { trigger },
    create: { trigger, templateId, isActive },
    update: { templateId, isActive },
  })
  revalidatePath('/admin/flows')
  return { error: '', success: true }
}

export async function removeFlow(trigger: FlowTrigger): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  await db.emailFlow.delete({ where: { trigger } }).catch(() => {})
  revalidatePath('/admin/flows')
  return { error: '', success: true }
}

export async function toggleFlow(trigger: FlowTrigger, isActive: boolean): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  await db.emailFlow.update({ where: { trigger }, data: { isActive } })
  revalidatePath('/admin/flows')
  return { error: '', success: true }
}
