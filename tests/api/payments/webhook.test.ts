import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    order: { findUnique: vi.fn(), update: vi.fn() },
    product: { update: vi.fn() },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/peach', () => ({
  queryPayment: vi.fn(),
  isSuccessCode: vi.fn(),
}))

vi.mock('@/lib/email', () => ({
  sendOrderConfirmationEmail: vi.fn(),
}))

import { NextRequest } from 'next/server'
import { POST } from '@/app/api/payments/webhook/route'
import { db } from '@/lib/db'
import { queryPayment, isSuccessCode } from '@/lib/peach'
import { sendOrderConfirmationEmail } from '@/lib/email'

const makeWebhookRequest = (resourcePath: string) =>
  new Request('http://localhost/api/payments/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ resourcePath }).toString(),
  }) as NextRequest

const pendingOrder = { id: 'order-1', status: 'PENDING', userId: 'user-1' }

const orderWithDetails = {
  id: 'order-1',
  status: 'PENDING',
  total: 130,
  createdAt: new Date(),
  deliveryAddress: {
    fullName: 'Alice',
    addressLine1: '1 Main St',
    city: 'Cape Town',
    province: 'Western Cape',
    postalCode: '8001',
    phone: '0821234567',
  },
  items: [
    { productId: 'p1', quantity: 2, priceAtPurchase: 50, product: { name: 'Honey' } },
  ],
  user: { name: 'Alice', email: 'alice@example.com' },
}

const successPayment = {
  id: 'payment-xyz',
  result: { code: '000.100.110', description: 'success' },
  merchantTransactionId: 'order-1',
}

describe('POST /api/payments/webhook', () => {
  beforeEach(() => {
    vi.mocked(db.order.findUnique).mockReset()
    vi.mocked(db.order.update).mockReset()
    vi.mocked(db.product.update).mockReset()
    ;(db.$transaction as unknown as Mock).mockReset()
    vi.mocked(queryPayment).mockReset()
    vi.mocked(isSuccessCode).mockReset()
    vi.mocked(sendOrderConfirmationEmail).mockReset()

    // Default: transaction resolves immediately (array form)
    ;(db.$transaction as unknown as Mock).mockResolvedValue([{}, {}])

    vi.mocked(db.order.update).mockResolvedValue({ id: 'order-1' } as any)
    vi.mocked(db.product.update).mockResolvedValue({ id: 'p1' } as any)
    vi.mocked(sendOrderConfirmationEmail).mockResolvedValue(undefined)
  })

  it('returns 200 and does nothing when resourcePath is missing', async () => {
    const res = await POST(
      new Request('http://localhost/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: '',
      }) as NextRequest,
    )
    expect(res.status).toBe(200)
    expect(vi.mocked(queryPayment)).not.toHaveBeenCalled()
  })

  it('returns 200 and does nothing when Peach re-query fails', async () => {
    vi.mocked(queryPayment).mockRejectedValue(new Error('network error'))

    const res = await POST(makeWebhookRequest('/v1/payments/xyz'))
    expect(res.status).toBe(200)
    expect(vi.mocked(db.order.findUnique)).not.toHaveBeenCalled()
  })

  it('returns 200 and does nothing for unknown merchantTransactionId', async () => {
    vi.mocked(queryPayment).mockResolvedValue(successPayment)
    vi.mocked(isSuccessCode).mockReturnValue(true)
    vi.mocked(db.order.findUnique).mockResolvedValue(null)

    const res = await POST(makeWebhookRequest('/v1/payments/xyz'))
    expect(res.status).toBe(200)
    expect(vi.mocked(db.order.update)).not.toHaveBeenCalled()
  })

  it('is idempotent — does nothing when order is already PAID', async () => {
    vi.mocked(queryPayment).mockResolvedValue(successPayment)
    vi.mocked(isSuccessCode).mockReturnValue(true)
    vi.mocked(db.order.findUnique).mockResolvedValue({ ...pendingOrder, status: 'PAID' } as any)

    const res = await POST(makeWebhookRequest('/v1/payments/xyz'))
    expect(res.status).toBe(200)
    expect(vi.mocked(db.$transaction as unknown as Mock)).not.toHaveBeenCalled()
  })

  it('updates order to PAID and decrements stock on success result code', async () => {
    vi.mocked(queryPayment).mockResolvedValue(successPayment)
    vi.mocked(isSuccessCode).mockReturnValue(true)
    vi.mocked(db.order.findUnique)
      .mockResolvedValueOnce(pendingOrder as any)          // first call: status check
      .mockResolvedValueOnce(orderWithDetails as any)      // second call: with includes

    const res = await POST(makeWebhookRequest('/v1/payments/xyz'))
    expect(res.status).toBe(200)

    expect(vi.mocked(db.order.update)).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'PAID' } }),
    )
    expect(vi.mocked(db.product.update)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: { stock: { decrement: 2 } },
      }),
    )
    expect(db.$transaction as unknown as Mock).toHaveBeenCalledOnce()
  })

  it('sends confirmation email exactly once on PAID', async () => {
    vi.mocked(queryPayment).mockResolvedValue(successPayment)
    vi.mocked(isSuccessCode).mockReturnValue(true)
    vi.mocked(db.order.findUnique)
      .mockResolvedValueOnce(pendingOrder as any)
      .mockResolvedValueOnce(orderWithDetails as any)

    await POST(makeWebhookRequest('/v1/payments/xyz'))

    expect(vi.mocked(sendOrderConfirmationEmail)).toHaveBeenCalledOnce()
    expect(vi.mocked(sendOrderConfirmationEmail)).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'order-1' }),
    )
  })

  it('returns 200 even when email send throws (order already committed)', async () => {
    vi.mocked(queryPayment).mockResolvedValue(successPayment)
    vi.mocked(isSuccessCode).mockReturnValue(true)
    vi.mocked(db.order.findUnique)
      .mockResolvedValueOnce(pendingOrder as any)
      .mockResolvedValueOnce(orderWithDetails as any)
    vi.mocked(sendOrderConfirmationEmail).mockRejectedValue(new Error('Resend unavailable'))

    const res = await POST(makeWebhookRequest('/v1/payments/xyz'))
    expect(res.status).toBe(200)
  })

  it('updates order to FAILED on failure result code', async () => {
    vi.mocked(queryPayment).mockResolvedValue({
      ...successPayment,
      result: { code: '800.100.155', description: 'declined' },
    })
    vi.mocked(isSuccessCode).mockReturnValue(false)
    vi.mocked(db.order.findUnique).mockResolvedValue(pendingOrder as any)
    vi.mocked(db.order.update).mockResolvedValue({ id: 'order-1', status: 'FAILED' } as any)

    const res = await POST(makeWebhookRequest('/v1/payments/xyz'))
    expect(res.status).toBe(200)
    expect(vi.mocked(db.order.update)).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'FAILED' } }),
    )
  })
})
