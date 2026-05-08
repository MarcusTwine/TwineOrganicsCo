import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ProductForm from '../../_components/ProductForm'

export const metadata: Metadata = { title: 'Edit Product' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!product) notFound()
  return <ProductForm product={product} categories={categories} />
}
