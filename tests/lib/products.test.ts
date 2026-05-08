import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

const { mockProductFindMany, mockProductFindUnique, mockCategoryFindMany } = vi.hoisted(() => ({
  mockProductFindMany: vi.fn(),
  mockProductFindUnique: vi.fn(),
  mockCategoryFindMany: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    product: {
      findMany: mockProductFindMany,
      findUnique: mockProductFindUnique,
    },
    category: {
      findMany: mockCategoryFindMany,
    },
  },
}))

import { getProducts, getProductBySlug, getFeaturedProducts, getCategories } from '@/lib/products'

beforeEach(() => {
  ;(mockProductFindMany as unknown as Mock).mockReset()
  ;(mockProductFindUnique as unknown as Mock).mockReset()
  ;(mockCategoryFindMany as unknown as Mock).mockReset()
})

describe('getProducts', () => {
  it('queries only active products sorted by createdAt desc', async () => {
    mockProductFindMany.mockResolvedValue([])
    await getProducts()
    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: true }),
        orderBy: { createdAt: 'desc' },
        include: { category: true },
      }),
    )
  })

  it('adds OR search filter when query is provided', async () => {
    mockProductFindMany.mockResolvedValue([])
    await getProducts({ query: 'honey' })
    const call = (mockProductFindMany as unknown as Mock).mock.calls[0][0]
    expect(call.where.OR).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: expect.objectContaining({ contains: 'honey' }) }),
        expect.objectContaining({ description: expect.objectContaining({ contains: 'honey' }) }),
      ]),
    )
  })

  it('adds category filter when categorySlug is provided', async () => {
    mockProductFindMany.mockResolvedValue([])
    await getProducts({ categorySlug: 'oils' })
    const call = (mockProductFindMany as unknown as Mock).mock.calls[0][0]
    expect(call.where.category).toEqual({ slug: 'oils' })
  })

  it('adds tag filter when tag is provided', async () => {
    mockProductFindMany.mockResolvedValue([])
    await getProducts({ tag: 'organic' })
    const call = (mockProductFindMany as unknown as Mock).mock.calls[0][0]
    expect(call.where.tags).toEqual({ has: 'organic' })
  })

  it('combines query and category filters together', async () => {
    mockProductFindMany.mockResolvedValue([])
    await getProducts({ query: 'honey', categorySlug: 'oils' })
    const call = (mockProductFindMany as unknown as Mock).mock.calls[0][0]
    expect(call.where.OR).toBeDefined()
    expect(call.where.category).toEqual({ slug: 'oils' })
  })
})

describe('getProductBySlug', () => {
  it('queries product by slug with category included', async () => {
    mockProductFindUnique.mockResolvedValue(null)
    await getProductBySlug('my-product')
    expect(mockProductFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'my-product' },
        include: { category: true },
      }),
    )
  })

  it('returns null when product not found', async () => {
    mockProductFindUnique.mockResolvedValue(null)
    const result = await getProductBySlug('missing')
    expect(result).toBeNull()
  })
})

describe('getFeaturedProducts', () => {
  it('queries featured active products with a limit of 6', async () => {
    mockProductFindMany.mockResolvedValue([])
    await getFeaturedProducts()
    expect(mockProductFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, isFeatured: true },
        take: 6,
        include: { category: true },
      }),
    )
  })
})

describe('getCategories', () => {
  it('returns all categories sorted by name', async () => {
    mockCategoryFindMany.mockResolvedValue([])
    await getCategories()
    expect(mockCategoryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { name: 'asc' } }),
    )
  })
})
