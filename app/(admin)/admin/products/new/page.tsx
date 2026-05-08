import type { Metadata } from 'next'
import { db } from '@/lib/db'
import ProductForm from '../_components/ProductForm'

export const metadata: Metadata = { title: 'New Product' }

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: 'asc' } })
  return <ProductForm categories={categories} />
}
