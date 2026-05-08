import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

const { mockProductUpdate, mockProductFindUnique, mockAdjustmentCreate } = vi.hoisted(() => ({
  mockProductUpdate: vi.fn(),
  mockProductFindUnique: vi.fn(),
  mockAdjustmentCreate: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    product: { update: mockProductUpdate, findUnique: mockProductFindUnique },
    stockAdjustment: { create: mockAdjustmentCreate },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { adjustStock } from '@/app/(admin)/admin/stock/actions'

const adminSession = { user: { id: 'admin1', role: 'ADMIN' } }
const mockAuth = auth as unknown as Mock

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue(adminSession)
})

describe('adjustStock', () => {
  it('returns error when not ADMIN', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'CUSTOMER' } })
    const fd = new FormData()
    const result = await adjustStock('prod1', { error: '', success: false }, fd)
    expect(result.error).toBe('Forbidden')
    expect(mockProductUpdate).not.toHaveBeenCalled()
  })

  it('returns error when quantity is 0 or negative', async () => {
    const fd = new FormData()
    fd.set('type', 'ADD')
    fd.set('quantity', '0')
    fd.set('reason', 'RESTOCK')
    const result = await adjustStock('prod1', { error: '', success: false }, fd)
    expect(result.error).toMatch(/positive/)
  })

  it('adds stock correctly', async () => {
    mockProductFindUnique.mockResolvedValue({ id: 'prod1', stock: 10 })
    mockProductUpdate.mockResolvedValue({})
    mockAdjustmentCreate.mockResolvedValue({})
    const fd = new FormData()
    fd.set('type', 'ADD')
    fd.set('quantity', '5')
    fd.set('reason', 'RESTOCK')
    const result = await adjustStock('prod1', { error: '', success: false }, fd)
    expect(result.error).toBe('')
    expect(mockProductUpdate).toHaveBeenCalledWith({
      where: { id: 'prod1' },
      data: { stock: 15 },
    })
  })

  it('removes stock but floors at 0', async () => {
    mockProductFindUnique.mockResolvedValue({ id: 'prod1', stock: 3 })
    mockProductUpdate.mockResolvedValue({})
    mockAdjustmentCreate.mockResolvedValue({})
    const fd = new FormData()
    fd.set('type', 'REMOVE')
    fd.set('quantity', '10')
    fd.set('reason', 'DAMAGED')
    const result = await adjustStock('prod1', { error: '', success: false }, fd)
    expect(result.error).toBe('')
    expect(mockProductUpdate).toHaveBeenCalledWith({
      where: { id: 'prod1' },
      data: { stock: 0 },
    })
  })

  it('writes a StockAdjustment record', async () => {
    mockProductFindUnique.mockResolvedValue({ id: 'prod1', stock: 10 })
    mockProductUpdate.mockResolvedValue({})
    mockAdjustmentCreate.mockResolvedValue({})
    const fd = new FormData()
    fd.set('type', 'ADD')
    fd.set('quantity', '5')
    fd.set('reason', 'RESTOCK')
    fd.set('note', 'Monthly restock')
    await adjustStock('prod1', { error: '', success: false }, fd)
    expect(mockAdjustmentCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        productId: 'prod1',
        adminId: 'admin1',
        type: 'ADD',
        quantity: 5,
        reason: 'RESTOCK',
        note: 'Monthly restock',
      }),
    })
  })
})
