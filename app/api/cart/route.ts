import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import {
  parseCart,
  addToCart,
  serializeCart,
  COOKIE_NAME,
  CART_COOKIE_OPTIONS,
  MAX_CART_ITEMS,
  isValidProductId,
} from '@/lib/cart'

export async function GET() {
  const cookieStore = await cookies()
  const cartCookie = cookieStore.get(COOKIE_NAME)
  return NextResponse.json(parseCart(cartCookie?.value))
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (
    !isValidProductId(body?.productId) ||
    typeof body?.quantity !== 'number' ||
    body.quantity <= 0 ||
    !Number.isInteger(body.quantity)
  ) {
    return NextResponse.json(
      { error: 'productId is required and quantity must be a positive integer' },
      { status: 400 },
    )
  }

  const cookieStore = await cookies()
  const cartCookie = cookieStore.get(COOKIE_NAME)
  const items = parseCart(cartCookie?.value)
  const updated = addToCart(items, body.productId as string, body.quantity as number)

  if (updated.length > MAX_CART_ITEMS) {
    return NextResponse.json({ error: 'Cart is full' }, { status: 400 })
  }

  cookieStore.set(COOKIE_NAME, serializeCart(updated), CART_COOKIE_OPTIONS)
  return NextResponse.json(updated)
}
