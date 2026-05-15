import Link from 'next/link'
import Image from 'next/image'

type Product = {
  id: string
  name: string
  slug: string
  price: number | { toString(): string }
  images: string[]
  category: { name: string } | null
}

interface Props {
  products: Product[]
}

export default function RecommendedProducts({ products }: Props) {
  if (products.length === 0) return null

  return (
    <section className="mt-16 border-t border-gray-100 pt-12">
      <h2 className="mb-8 text-xl font-semibold tracking-tight text-gray-900">
        Recommended for you
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-square overflow-hidden bg-cream">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <span className="text-4xl text-gray-200">✦</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1 p-3">
              {product.category && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-earth">
                  {product.category.name}
                </p>
              )}
              <p className="text-sm font-medium leading-snug text-gray-900 group-hover:text-forest">
                {product.name}
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-800">
                R{Number(product.price).toFixed(2)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
