import { getProducts, getCategories } from '@/lib/products'
import ProductCard from '@/components/store/ProductCard'
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

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { q, category, tag, ...overrides }
    for (const [k, v] of Object.entries(merged)) {
      if (v) params.set(k, v)
    }
    const qs = params.toString()
    return qs ? `/products?${qs}` : '/products'
  }

  const [products, categories] = await Promise.all([
    getProducts({ query: q, categorySlug: category, tag }),
    getCategories(),
  ])

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Shop</h1>

      {/* Search form — plain HTML form so it works without JS */}
      <form method="GET" className="mb-6 flex gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        {tag && <input type="hidden" name="tag" value={tag} />}
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Search
        </button>
        {q && (
          <Link
            href={buildUrl({ q: undefined })}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Category filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={buildUrl({ category: undefined })}
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            !category
              ? 'bg-green-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={buildUrl({ category: cat.slug })}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              category === cat.slug
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Results */}
      {q && (
        <p className="mb-4 text-sm text-gray-500">
          {products.length} result{products.length !== 1 ? 's' : ''} for &ldquo;{q}&rdquo;
        </p>
      )}

      {products.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">No products found.</p>
          <Link href="/products" className="mt-2 block text-sm text-green-700 hover:underline">
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
    </main>
  )
}
