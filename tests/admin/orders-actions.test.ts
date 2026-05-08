import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

const { mockOrderUpdate, mockOrderNoteCreate } = vi.hoisted(() => ({
  mockOrderUpdate: vi.fn(),
  mockOrderNoteCreate: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  db: {
    order: { update: mockOrderUpdate },
    orderNote: { create: mockOrderNoteCreate },
  },
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }))

import { auth } from '@/lib/auth'
import { updateOrderStatus, addOrderNote } from '@/app/(admin)/admin/orders/actions'

const adminSession = { user: { id: 'admin1', role: 'ADMIN' } }
const mockAuth = auth as unknown as Mock

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue(adminSession)
})

describe('updateOrderStatus', () => {
  it('returns error when not ADMIN', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'CUSTOMER' } })
    const fd = new FormData()
    const result = await updateOrderStatus('ord1', { error: '', success: false }, fd)
    expect(result.error).toBe('Forbidden')
    expect(mockOrderUpdate).not.toHaveBeenCalled()
  })

  it('updates order status', async () => {
    mockOrderUpdate.mockResolvedValue({})
    const fd = new FormData()
    fd.set('status', 'SHIPPED')
    const result = await updateOrderStatus('ord1', { error: '', success: false }, fd)
    expect(result.error).toBe('')
    expect(mockOrderUpdate).toHaveBeenCalledWith({
      where: { id: 'ord1' },
      data: { status: 'SHIPPED' },
    })
  })

  it('returns error when status missing', async () => {
    const fd = new FormData()
    const result = await updateOrderStatus('ord1', { error: '', success: false }, fd)
    expect(result.error).toMatch(/required/)
  })
})

describe('addOrderNote', () => {
  it('creates note with authorId from session', async () => {
    mockOrderNoteCreate.mockResolvedValue({})
    const fd = new FormData()
    fd.set('body', 'Customer called about delivery')
    const result = await addOrderNote('ord1', { error: '', success: false }, fd)
    expect(result.error).toBe('')
    expect(mockOrderNoteCreate).toHaveBeenCalledWith({
      data: { orderId: 'ord1', authorId: 'admin1', body: 'Customer called about delivery' },
    })
  })

  it('returns error when body empty', async () => {
    const fd = new FormData()
    fd.set('body', '')
    const result = await addOrderNote('ord1', { error: '', success: false }, fd)
    expect(result.error).toMatch(/required/)
  })
})
