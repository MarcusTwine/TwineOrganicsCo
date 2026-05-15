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

export async function getRecommendedProducts(
  productId: string,
  categoryId: string,
  tags: string[],
  limit = 4,
) {
  // 1. Frequently bought together: orders that include this product → rank co-products by frequency
  const orderItems = await db.orderItem.findMany({
    where: { productId },
    select: { orderId: true },
  })

  const orderIds = orderItems.map((oi) => oi.orderId)
  let fbtIds: string[] = []

  if (orderIds.length > 0) {
    const co = await db.orderItem.groupBy({
      by: ['productId'],
      where: { orderId: { in: orderIds }, productId: { not: productId } },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    })
    fbtIds = co.map((r) => r.productId)
  }

  // 2. Similar: same category or shared tags, excluding current + FBT already found
  const exclude = [productId, ...fbtIds]
  const needed = limit - fbtIds.length

  const tagFilters = tags.map((t) => ({ tags: { has: t } }))
  const similarOrFilters = [{ categoryId }, ...(tagFilters.length > 0 ? tagFilters : [])]

  const similar =
    needed > 0
      ? await db.product.findMany({
          where: { isActive: true, id: { notIn: exclude }, OR: similarOrFilters },
          include: { category: true },
          take: needed,
          orderBy: { createdAt: 'desc' },
        })
      : []

  // 3. Fetch FBT products
  const fbt =
    fbtIds.length > 0
      ? await db.product.findMany({
          where: { id: { in: fbtIds }, isActive: true },
          include: { category: true },
        })
      : []

  const combined = [...fbt, ...similar]

  // 4. Fallback: fill remaining slots with any active products
  if (combined.length < limit) {
    const fallback = await db.product.findMany({
      where: { isActive: true, id: { notIn: [productId, ...combined.map((p) => p.id)] } },
      include: { category: true },
      take: limit - combined.length,
      orderBy: { createdAt: 'desc' },
    })
    combined.push(...fallback)
  }

  return combined.slice(0, limit)
}
