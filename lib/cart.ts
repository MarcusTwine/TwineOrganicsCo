export type CartItem = {
  productId: string
  quantity: number
}

export const COOKIE_NAME = 'twine_cart'
export const MAX_COOKIE_AGE = 60 * 60 * 24 * 30 // 30 days in seconds

export function parseCart(cookieValue: string | undefined): CartItem[] {
  if (!cookieValue) return []
  try {
    const parsed = JSON.parse(cookieValue)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is CartItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.productId === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0,
    )
  } catch {
    return []
  }
}

export function serializeCart(items: CartItem[]): string {
  return JSON.stringify(items)
}

export function addToCart(items: CartItem[], productId: string, quantity = 1): CartItem[] {
  if (quantity <= 0) return items
  const existing = items.find((i) => i.productId === productId)
  if (existing) {
    return items.map((i) =>
      i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i,
    )
  }
  return [...items, { productId, quantity }]
}

export function removeFromCart(items: CartItem[], productId: string): CartItem[] {
  return items.filter((i) => i.productId !== productId)
}

/**
 * Update the quantity of an item in the cart.
 * If quantity <= 0, removes the item from the cart.
 * If productId is not found and quantity > 0, this is a no-op (returns items unchanged).
 * Use addToCart to add new items, not updateCartQuantity.
 */
export function updateCartQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  if (quantity <= 0) return removeFromCart(items, productId)
  return items.map((i) => (i.productId === productId ? { ...i, quantity } : i))
}

export function cartTotal(items: CartItem[], prices: Record<string, number>): number {
  return items.reduce((sum, item) => sum + (prices[item.productId] ?? 0) * item.quantity, 0)
}

export const CART_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: MAX_COOKIE_AGE,
  path: '/',
  // Use COOKIE_SECURE=true only when the site is actually served over HTTPS.
  // NODE_ENV=production does not imply HTTPS (e.g. HTTP on a LAN/internal host).
  secure: process.env.COOKIE_SECURE === 'true',
}

export const MAX_CART_ITEMS = 50
export const MAX_PRODUCT_ID_LENGTH = 128

export function isValidProductId(id: unknown): id is string {
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    id.length <= MAX_PRODUCT_ID_LENGTH &&
    /^[\w-]+$/.test(id)
  )
}
