import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { createCheckout, queryPayment, isSuccessCode } from '@/lib/peach'

describe('createCheckout', () => {
  beforeEach(() => mockFetch.mockReset())

  it('POSTs to Peach /v1/checkouts and returns checkoutId + redirectUrl', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'checkout-abc', result: { code: '000.200.100' } }),
    })

    const result = await createCheckout({
      amount: '149.99',
      currency: 'ZAR',
      orderId: 'order-123',
      shopperResultUrl: 'http://localhost:3000/checkout/result?orderId=order-123',
    })

    expect(result.checkoutId).toBe('checkout-abc')
    expect(result.redirectUrl).toContain('checkout-abc')

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toContain('/v1/checkouts')
    expect(options.method).toBe('POST')
    expect(options.headers['Authorization']).toContain('Bearer')

    const body = new URLSearchParams(options.body as string)
    expect(body.get('amount')).toBe('149.99')
    expect(body.get('currency')).toBe('ZAR')
    expect(body.get('merchantTransactionId')).toBe('order-123')
    expect(body.get('paymentType')).toBe('DB')
  })

  it('throws when Peach returns a non-ok HTTP response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, statusText: 'Internal Server Error' })
    await expect(
      createCheckout({ amount: '10.00', currency: 'ZAR', orderId: 'x', shopperResultUrl: 'http://x' }),
    ).rejects.toThrow(/Peach API error/)
  })

  it('throws when response contains no id (validation failure)', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ result: { code: '800.400.100', description: 'invalid amount format' } }),
    })
    await expect(
      createCheckout({ amount: 'bad', currency: 'ZAR', orderId: 'x', shopperResultUrl: 'http://x' }),
    ).rejects.toThrow(/invalid amount format/)
  })
})

describe('queryPayment', () => {
  beforeEach(() => mockFetch.mockReset())

  it('GETs the payment resource and returns id, result, merchantTransactionId', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'payment-xyz',
        result: { code: '000.100.110', description: 'Request successfully processed' },
        merchantTransactionId: 'order-123',
      }),
    })

    const result = await queryPayment('/v1/payments/payment-xyz')

    expect(result.id).toBe('payment-xyz')
    expect(result.result.code).toBe('000.100.110')
    expect(result.merchantTransactionId).toBe('order-123')

    const [url, options] = mockFetch.mock.calls[0]
    expect(url).toContain('/v1/payments/payment-xyz')
    expect(options.headers['Authorization']).toContain('Bearer')
  })

  it('throws on non-ok HTTP response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' })
    await expect(queryPayment('/v1/payments/bad')).rejects.toThrow(/Peach API error/)
  })
})

describe('isSuccessCode', () => {
  it('returns true for 000.000.000 (live success)', () =>
    expect(isSuccessCode('000.000.000')).toBe(true))
  it('returns true for 000.100.110 (sandbox success)', () =>
    expect(isSuccessCode('000.100.110')).toBe(true))
  it('returns false for 800.100.155 (rejection)', () =>
    expect(isSuccessCode('800.100.155')).toBe(false))
  it('returns false for 000.400.101 (soft decline)', () =>
    expect(isSuccessCode('000.400.101')).toBe(false))
})
