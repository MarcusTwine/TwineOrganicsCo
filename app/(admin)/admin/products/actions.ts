'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

type State = { error: string; success: boolean }

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export async function createProduct(prev: State, fd: FormData): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const name = fd.get('name')?.toString().trim() ?? ''
  const description = fd.get('description')?.toString() ?? ''
  const price = parseFloat(fd.get('price')?.toString() ?? '')
  const stock = parseInt(fd.get('stock')?.toString() ?? '', 10)
  const categoryId = fd.get('categoryId')?.toString() ?? ''
  const slug = fd.get('slug')?.toString().trim() || slugify(name)
  const isActive = fd.get('isActive') === 'true'
  const isFeatured = fd.get('isFeatured') === 'true'
  const images: string[] = JSON.parse(fd.get('images')?.toString() ?? '[]')
  const tags: string[] = JSON.parse(fd.get('tags')?.toString() ?? '[]')

  if (!name || !categoryId || isNaN(price) || isNaN(stock)) {
    return { error: 'Name, slug, category, price, and stock are required', success: false }
  }

  try {
    await db.product.create({
      data: { name, description, price, stock, categoryId, slug, isActive, isFeatured, images, tags },
    })
  } catch {
    return { error: 'Failed to create product', success: false }
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  redirect('/admin/products')
  return { error: '', success: true }
}

export async function updateProduct(id: string, prev: State, fd: FormData): Promise<State> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return { error: 'Forbidden', success: false }

  const name = fd.get('name')?.toString().trim() ?? ''
  const description = fd.get('description')?.toString() ?? ''
  const price = parseFloat(fd.get('price')?.toString() ?? '')
  const stock = parseInt(fd.get('stock')?.toString() ?? '', 10)
  const categoryId = fd.get('categoryId')?.toString() ?? ''
  const slug = fd.get('slug')?.toString().trim() || slugify(name)
  const isActive = fd.get('isActive') === 'true'
  const isFeatured = fd.get('isFeatured') === 'true'
  const images: string[] = JSON.parse(fd.get('images')?.toString() ?? '[]')
  const tags: string[] = JSON.parse(fd.get('tags')?.toString() ?? '[]')

  if (!name || !categoryId || isNaN(price) || isNaN(stock)) {
    return { error: 'Name, slug, category, price, and stock are required', success: false }
  }

  try {
    await db.product.update({
      where: { id },
      data: { name, description, price, stock, categoryId, slug, isActive, isFeatured, images, tags },
    })
  } catch {
    return { error: 'Failed to update product', success: false }
  }

  revalidatePath('/admin/products')
  revalidatePath('/products')
  revalidatePath(`/products/${slug}`)
  redirect('/admin/products')
  return { error: '', success: true }
}

export async function deleteProduct(id: string): Promise<void> {
  const session = await getSession()
  if (session?.user?.role !== 'ADMIN') return

  await db.product.update({ where: { id }, data: { isActive: false } })
  revalidatePath('/admin/products')
  revalidatePath('/products')
}
