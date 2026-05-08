'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

type State = { error: string; success: boolean }

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function createCategory(prev: State, fd: FormData): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const name = fd.get('name')?.toString().trim() ?? ''
  if (!name) return { error: 'Name is required', success: false }

  const slug = slugify(name)

  try {
    await db.category.create({ data: { name, slug } })
  } catch {
    return { error: 'A category with that name already exists', success: false }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
  return { error: '', success: true }
}

export async function deleteCategory(id: string): Promise<void> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return

  await db.category.delete({ where: { id } })
  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
}
