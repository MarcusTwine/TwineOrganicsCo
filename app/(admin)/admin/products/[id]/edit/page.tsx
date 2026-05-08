import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ProductForm from '../../_components/ProductForm'

export const metadata: Metadata = { title: 'Edit Product' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [raw, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!raw) notFound()

  // Serialise Prisma Decimal → plain number before passing to Client Component
  const product = {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: Number(raw.price),
    stock: raw.stock,
    categoryId: raw.categoryId,
    slug: raw.slug,
    isActive: raw.isActive,
    isFeatured: raw.isFeatured,
    images: raw.images as string[],
    tags: raw.tags as string[],
  }

  return <ProductForm product={product} categories={categories} />
}
