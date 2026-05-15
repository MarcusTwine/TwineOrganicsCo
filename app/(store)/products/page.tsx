import { getProducts, getCategories } from '@/lib/products'
import ProductCard from '@/components/store/ProductCard'
import ShopFilterMenu from '@/components/store/ShopFilterMenu'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Browse our range of organic products from Twine Organics.',
}

interface Props {
  searchParams: Promise<{ q?: string; category?: string; tag?: string }>
}

export default async function ProductsPage({ searchParams }: Props) {
  const { q, category, tag } = await searchParams

  const [products, categories] = await Promise.all([
    getProducts({ query: q, categorySlug: category, tag }),
    getCategories(),
  ])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">Shop</h1>

      {products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">No products found.</p>
          <Link href="/products" className="mt-2 block text-sm text-forest hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Floating filter menu — desktop only */}
      <ShopFilterMenu
        categories={categories}
        currentCategory={category}
        currentQuery={q}
      />
    </main>
  )
}
