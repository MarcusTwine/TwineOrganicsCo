import { cache } from 'react'
import { db } from '@/lib/db'

// NOTE: product.price is Prisma.Decimal — use Number(product.price) or .toString() before
// rendering in JSX or passing to client components. Decimal is not JSON-serializable.

export async function getProducts(opts: {
  query?: string
  categorySlug?: string
  tag?: string
} = {}) {
  const { query, categorySlug, tag } = opts
  return db.product.findMany({
    where: {
      isActive: true,
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })
}

/**
 * Returns null when no product matches the slug.
 * NOTE: Does NOT filter by isActive — callers must check product.isActive themselves.
 * The product page calls notFound() when !product.isActive.
 */
export const getProductBySlug = cache(async (slug: string) => {
  return db.product.findUnique({
    where: { slug },
    include: { category: true },
  })
})

export async function getFeaturedProducts() {
  return db.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true },
    take: 6,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getCategories() {
  return db.category.findMany({ orderBy: { name: 'asc' } })
}
