import Link from 'next/link'
import Image from 'next/image'
import type { getProducts } from '@/lib/products'

type Product = Awaited<ReturnType<typeof getProducts>>[number]

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="relative h-48 overflow-hidden bg-gray-100">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-green-50">
              <span className="text-4xl text-green-200">✦</span>
            </div>
          )}
        </div>
        <div className="p-4">
          {product.category && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-green-700">
              {product.category.name}
            </p>
          )}
          <h2 className="font-semibold text-gray-900 group-hover:text-green-800">
            {product.name}
          </h2>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-lg font-bold text-gray-900">
              R{Number(product.price).toFixed(2)}
            </p>
            {product.stock === 0 && (
              <span className="text-xs text-red-500">Out of stock</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
