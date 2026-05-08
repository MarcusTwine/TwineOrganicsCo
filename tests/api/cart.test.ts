import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

// Must be hoisted so vi.mock can reference them
const { mockCookieGet, mockCookieSet, mockCookiesStore, mockCookies } = vi.hoisted(() => {
  const mockCookieGet = vi.fn()
  const mockCookieSet = vi.fn()
  const mockCookiesStore = { get: mockCookieGet, set: mockCookieSet }
  const mockCookies = vi.fn().mockResolvedValue(mockCookiesStore)
  return { mockCookieGet, mockCookieSet, mockCookiesStore, mockCookies }
})

vi.mock('next/headers', () => ({
  cookies: mockCookies,
}))

import { GET, POST } from '@/app/api/cart/route'
import { PATCH, DELETE } from '@/app/api/cart/[productId]/route'

const makeReq = (method: string, body?: object) =>
  new Request('http://localhost/api/cart', {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  }) as any

beforeEach(() => {
  ;(mockCookieGet as unknown as Mock).mockReset()
  ;(mockCookieSet as unknown as Mock).mockReset()
})

describe('GET /api/cart', () => {
  it('returns empty array when no cart cookie', async () => {
    mockCookieGet.mockReturnValue(undefined)
    const res = await GET()
    const body = await res.json()
    expect(body).toEqual([])
  })

  it('returns parsed cart from cookie', async () => {
    const cartData = [{ productId: 'p1', quantity: 2 }]
    mockCookieGet.mockReturnValue({ value: JSON.stringify(cartData) })
    const res = await GET()
    const body = await res.json()
    expect(body).toEqual(cartData)
  })
})

describe('POST /api/cart', () => {
  it('returns 400 when productId is missing', async () => {
    const res = await POST(makeReq('POST', { quantity: 1 }))
    expect(res.status).toBe(400)
  })

  it('adds item to empty cart and sets cookie', async () => {
    mockCookieGet.mockReturnValue(undefined)
    const res = await POST(makeReq('POST', { productId: 'p1', quantity: 1 }))
    const body = await res.json()
    expect(body).toEqual([{ productId: 'p1', quantity: 1 }])
    expect(mockCookieSet).toHaveBeenCalledWith(
      'twine_cart',
      expect.any(String),
      expect.objectContaining({ httpOnly: true, secure: expect.any(Boolean) }),
    )
  })

  it('increments quantity for existing product', async () => {
    mockCookieGet.mockReturnValue({
      value: JSON.stringify([{ productId: 'p1', quantity: 1 }]),
    })
    const res = await POST(makeReq('POST', { productId: 'p1', quantity: 2 }))
    const body = await res.json()
    expect(body).toEqual([{ productId: 'p1', quantity: 3 }])
  })
})

describe('PATCH /api/cart/[productId]', () => {
  it('returns 400 when quantity is missing', async () => {
    const res = await PATCH(makeReq('PATCH', {}), {
      params: Promise.resolve({ productId: 'p1' }),
    })
    expect(res.status).toBe(400)
  })

  it('updates quantity and sets cookie', async () => {
    mockCookieGet.mockReturnValue({
      value: JSON.stringify([{ productId: 'p1', quantity: 1 }]),
    })
    const res = await PATCH(makeReq('PATCH', { quantity: 5 }), {
      params: Promise.resolve({ productId: 'p1' }),
    })
    const body = await res.json()
    expect(body).toEqual([{ productId: 'p1', quantity: 5 }])
    expect(mockCookieSet).toHaveBeenCalled()
  })
})

describe('DELETE /api/cart/[productId]', () => {
  it('removes the product and sets cookie', async () => {
    mockCookieGet.mockReturnValue({
      value: JSON.stringify([
        { productId: 'p1', quantity: 2 },
        { productId: 'p2', quantity: 1 },
      ]),
    })
    const res = await DELETE(makeReq('DELETE'), {
      params: Promise.resolve({ productId: 'p1' }),
    })
    const body = await res.json()
    expect(body).toEqual([{ productId: 'p2', quantity: 1 }])
    expect(mockCookieSet).toHaveBeenCalledWith(
      'twine_cart',
      expect.any(String),
      expect.objectContaining({ httpOnly: true }),
    )
  })
})
