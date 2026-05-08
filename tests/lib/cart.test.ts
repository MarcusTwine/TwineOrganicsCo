import { describe, it, expect } from 'vitest'
import {
  parseCart,
  serializeCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  cartTotal,
} from '@/lib/cart'
import type { CartItem } from '@/lib/cart'

const items: CartItem[] = [
  { productId: 'p1', quantity: 2 },
  { productId: 'p2', quantity: 1 },
]

describe('parseCart', () => {
  it('returns empty array for undefined input', () => {
    expect(parseCart(undefined)).toEqual([])
  })
  it('returns empty array for invalid JSON', () => {
    expect(parseCart('not-json')).toEqual([])
  })
  it('returns empty array for non-array JSON', () => {
    expect(parseCart('{"foo":"bar"}')).toEqual([])
  })
  it('filters out items missing required fields', () => {
    const raw = JSON.stringify([{ productId: 'p1' }, { productId: 'p2', quantity: 1 }])
    expect(parseCart(raw)).toEqual([{ productId: 'p2', quantity: 1 }])
  })
  it('filters out items with quantity <= 0', () => {
    const raw = JSON.stringify([{ productId: 'p1', quantity: 0 }])
    expect(parseCart(raw)).toEqual([])
  })
  it('parses a valid cart correctly', () => {
    expect(parseCart(JSON.stringify(items))).toEqual(items)
  })
})

describe('serializeCart', () => {
  it('round-trips through parseCart', () => {
    expect(parseCart(serializeCart(items))).toEqual(items)
  })
})

describe('addToCart', () => {
  it('appends a new product', () => {
    const result = addToCart(items, 'p3', 1)
    expect(result).toHaveLength(3)
    expect(result.find((i) => i.productId === 'p3')).toEqual({ productId: 'p3', quantity: 1 })
  })
  it('increments quantity for an existing product', () => {
    const result = addToCart(items, 'p1', 3)
    expect(result.find((i) => i.productId === 'p1')?.quantity).toBe(5)
    expect(result).toHaveLength(2)
  })
  it('defaults quantity to 1 when omitted', () => {
    const result = addToCart([], 'p1')
    expect(result).toEqual([{ productId: 'p1', quantity: 1 }])
  })
  it('returns unchanged cart when quantity is 0 or negative', () => {
    expect(addToCart(items, 'p1', 0)).toEqual(items)
    expect(addToCart(items, 'p3', -1)).toEqual(items)
  })
})

describe('removeFromCart', () => {
  it('removes the specified product', () => {
    const result = removeFromCart(items, 'p1')
    expect(result).toHaveLength(1)
    expect(result.find((i) => i.productId === 'p1')).toBeUndefined()
  })
  it('returns unchanged cart for unknown productId', () => {
    expect(removeFromCart(items, 'p99')).toEqual(items)
  })
})

describe('updateCartQuantity', () => {
  it('updates quantity for an existing item', () => {
    const result = updateCartQuantity(items, 'p1', 5)
    expect(result.find((i) => i.productId === 'p1')?.quantity).toBe(5)
  })
  it('removes item when quantity is set to 0', () => {
    const result = updateCartQuantity(items, 'p1', 0)
    expect(result.find((i) => i.productId === 'p1')).toBeUndefined()
    expect(result).toHaveLength(1)
  })
  it('removes item when quantity is negative', () => {
    const result = updateCartQuantity(items, 'p1', -1)
    expect(result.find((i) => i.productId === 'p1')).toBeUndefined()
  })
  it('is a no-op for unknown productId with positive quantity', () => {
    expect(updateCartQuantity(items, 'p99', 5)).toEqual(items)
  })
})

describe('cartTotal', () => {
  it('computes the subtotal correctly', () => {
    // p1: 2 × 10 = 20, p2: 1 × 25 = 25 → 45
    expect(cartTotal(items, { p1: 10, p2: 25 })).toBe(45)
  })
  it('skips items with no matching price', () => {
    expect(cartTotal(items, { p1: 10 })).toBe(20)
  })
  it('returns 0 for an empty cart', () => {
    expect(cartTotal([], { p1: 10 })).toBe(0)
  })
})
