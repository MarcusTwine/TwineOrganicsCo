import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

const { mockProductCreate, mockProductUpdate, mockProductFindUnique } = vi.hoisted(() => ({
  mockProductCreate: vi.fn(),
  mockProductUpdate: vi.fn(),
  mockProductFindUnique: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    product: {
      create: mockProductCreate,
      update: mockProductUpdate,
      findUnique: mockProductFindUnique,
    },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { createProduct, updateProduct, deleteProduct } from '@/app/(admin)/admin/products/actions'

const adminSession = { user: { id: 'u1', role: 'ADMIN' } }
const mockAuth = auth as unknown as Mock

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue(adminSession)
})

describe('createProduct', () => {
  it('returns error when not ADMIN', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'CUSTOMER' } })
    const fd = new FormData()
    const result = await createProduct({ error: '', success: false }, fd)
    expect(result.error).toBe('Forbidden')
    expect(mockProductCreate).not.toHaveBeenCalled()
  })

  it('returns error when required fields missing', async () => {
    const fd = new FormData()
    const result = await createProduct({ error: '', success: false }, fd)
    expect(result.error).toMatch(/required/)
  })

  it('creates product with correct data', async () => {
    mockProductCreate.mockResolvedValue({ id: 'p1' })
    const fd = new FormData()
    fd.set('name', 'Rooibos Tea')
    fd.set('description', '<p>Great tea</p>')
    fd.set('price', '49.99')
    fd.set('stock', '100')
    fd.set('categoryId', 'cat1')
    fd.set('slug', 'rooibos-tea')
    fd.set('isActive', 'true')
    fd.set('isFeatured', 'false')
    fd.set('images', JSON.stringify(['/uploads/products/img.jpg']))
    fd.set('tags', JSON.stringify(['tea', 'organic']))
    const result = await createProduct({ error: '', success: false }, fd)
    expect(result.error).toBe('')
    expect(mockProductCreate).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ name: 'Rooibos Tea', price: 49.99, stock: 100 }),
    }))
  })
})

describe('deleteProduct', () => {
  it('soft-deletes by setting isActive = false', async () => {
    mockProductUpdate.mockResolvedValue({})
    await deleteProduct('p1')
    expect(mockProductUpdate).toHaveBeenCalledWith({
      where: { id: 'p1' },
      data: { isActive: false },
    })
  })
})
