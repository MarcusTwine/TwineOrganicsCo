import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProductBySlug, getRecommendedProducts } from '@/lib/products'
import AddToCartButton from '@/components/store/AddToCartButton'
import RecommendedProducts from '@/components/store/RecommendedProducts'

interface Props {
  params: Promise<{ slug: string }>
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product || !product.isActive) return { title: 'Product not found' }
  const plainDesc = stripHtml(product.description)
  const metaDesc = plainDesc.length > 157 ? plainDesc.slice(0, 157) + '…' : plainDesc
  return {
    title: product.name,
    description: metaDesc,
    openGraph: {
      title: product.name,
      description: metaDesc,
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product || !product.isActive) notFound()

  const recommended = await getRecommendedProducts(product.id, product.categoryId, product.tags)

  const inStock = product.stock > 0

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/products" className="hover:text-forest">
          Shop
        </Link>
        {product.category && (
          <>
            <span className="mx-2">/</span>
            <Link
              href={`/products?category=${product.category.slug}`}
              className="hover:text-forest"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Image gallery — shows main image; full gallery in a future plan */}
        <div className="relative h-80 overflow-hidden rounded-lg bg-gray-100 lg:h-[500px]">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-cream">
              <span className="text-8xl text-green-200">✦</span>
            </div>
          )}
        </div>

        {/* Product details */}
        <div>
          {product.category && (
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-forest">
              {product.category.name}
            </p>
          )}

          <h1 className="mb-4 text-3xl font-bold text-gray-900">{product.name}</h1>

          <p className="mb-6 text-3xl font-bold text-gray-900">
            R{Number(product.price).toFixed(2)}
          </p>

          <div
            className="prose prose-sm prose-gray mb-6 max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />

          {inStock ? (
            <div className="space-y-3">
              <p className="text-sm text-forest">
                In stock ({product.stock} available)
              </p>
              <AddToCartButton productId={product.id} productName={product.name} stock={product.stock} />
            </div>
          ) : (
            <p className="font-medium text-red-600">Out of stock</p>
          )}

          {product.tags.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/products?tag=${encodeURIComponent(tag)}`}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-cream hover:text-forest"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <RecommendedProducts products={recommended} />
    </main>
  )
}
