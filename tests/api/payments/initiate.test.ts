import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    product: { findMany: vi.fn() },
    order: { create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/peach', () => ({
  createCheckout: vi.fn(),
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
}))

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
}))

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/payments/initiate/route'
import { db } from '@/lib/db'
import { createCheckout } from '@/lib/peach'

const makeRequest = (body: object) =>
  new Request('http://localhost/api/payments/initiate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest

const validAddress = {
  fullName: 'Alice',
  addressLine1: '1 Main St',
  city: 'Cape Town',
  province: 'Western Cape',
  postalCode: '8001',
  phone: '0821234567',
}

const validCart = [
  { productId: 'p1', quantity: 2 },
  { productId: 'p2', quantity: 1 },
]

const mockProducts = [
  { id: 'p1', price: 50, stock: 10, isActive: true },
  { id: 'p2', price: 30, stock: 5, isActive: true },
]

describe('POST /api/payments/initiate', () => {
  beforeEach(() => {
    vi.mocked(db.product.findMany).mockReset()
    vi.mocked(db.order.create).mockReset()
    vi.mocked(db.order.update).mockReset()
    ;(db.$transaction as unknown as Mock).mockReset()
    vi.mocked(createCheckout).mockReset()

    ;(db.$transaction as unknown as Mock).mockImplementation(async (fn: any) => {
      const orderItemCreateMany = vi.fn().mockResolvedValue({ count: 1 })
      return fn({
        order: { create: vi.mocked(db.order.create) },
        orderItem: { createMany: orderItemCreateMany },
      })
    })

    vi.mocked(db.order.create).mockResolvedValue({
      id: 'order-123',
      userId: 'user-1',
      status: 'PENDING',
      total: 130,
    } as any)

    vi.mocked(db.order.update).mockResolvedValue({
      id: 'order-123',
      peachPaymentId: 'checkout-abc',
    } as any)

    vi.mocked(createCheckout).mockResolvedValue({
      checkoutId: 'checkout-abc',
      redirectUrl: 'https://eu-test.oppwa.com/v1/paymentWidgets.js?checkoutId=checkout-abc',
    })
  })

  it('returns 400 when cart is empty', async () => {
    const res = await POST(makeRequest({ cartItems: [], address: validAddress }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when address is missing', async () => {
    const res = await POST(makeRequest({ cartItems: validCart }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when address fields are incomplete', async () => {
    const res = await POST(
      makeRequest({ cartItems: validCart, address: { fullName: 'Alice' } }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 409 when a product is inactive', async () => {
    vi.mocked(db.product.findMany).mockResolvedValue([
      { id: 'p1', price: 50, stock: 10, isActive: false },
      { id: 'p2', price: 30, stock: 5, isActive: true },
    ] as any)
    const res = await POST(makeRequest({ cartItems: validCart, address: validAddress }))
    expect(res.status).toBe(409)
  })

  it('returns 409 when stock is insufficient for a cart item', async () => {
    vi.mocked(db.product.findMany).mockResolvedValue([
      { id: 'p1', price: 50, stock: 1, isActive: true },
      { id: 'p2', price: 30, stock: 5, isActive: true },
    ] as any)
    const res = await POST(makeRequest({ cartItems: validCart, address: validAddress }))
    expect(res.status).toBe(409)
  })

  it('creates order with server-calculated total and returns redirectUrl', async () => {
    vi.mocked(db.product.findMany).mockResolvedValue(mockProducts as any)

    const res = await POST(makeRequest({ cartItems: validCart, address: validAddress }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.redirectUrl).toContain('checkout-abc')

    expect(vi.mocked(db.order.create)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          total: 130,
          userId: 'user-1',
          status: 'PENDING',
        }),
      }),
    )
  })

  it('stores checkoutId as peachPaymentId on the order', async () => {
    vi.mocked(db.product.findMany).mockResolvedValue(mockProducts as any)

    await POST(makeRequest({ cartItems: validCart, address: validAddress }))

    expect(vi.mocked(db.order.update)).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { peachPaymentId: 'checkout-abc' },
      }),
    )
  })

  it('returns 502 and does not update peachPaymentId when Peach API fails', async () => {
    vi.mocked(db.product.findMany).mockResolvedValue(mockProducts as any)
    vi.mocked(createCheckout).mockRejectedValue(new Error('Peach unavailable'))

    const res = await POST(makeRequest({ cartItems: validCart, address: validAddress }))

    expect(res.status).toBe(502)
    expect(vi.mocked(db.order.update)).not.toHaveBeenCalled()
  })
})
