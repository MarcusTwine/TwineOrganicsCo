import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import {
  parseCart,
  removeFromCart,
  updateCartQuantity,
  serializeCart,
  COOKIE_NAME,
  CART_COOKIE_OPTIONS,
  isValidProductId,
} from '@/lib/cart'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params

  if (!isValidProductId(productId)) {
    return NextResponse.json({ error: 'invalid productId' }, { status: 400 })
  }

  const body = await req.json().catch(() => null)

  if (
    typeof body?.quantity !== 'number' ||
    body.quantity <= 0 ||
    !Number.isInteger(body.quantity)
  ) {
    return NextResponse.json(
      { error: 'quantity must be a positive integer' },
      { status: 400 },
    )
  }

  const cookieStore = await cookies()
  const items = parseCart(cookieStore.get(COOKIE_NAME)?.value)
  const updated = updateCartQuantity(items, productId, body.quantity as number)

  cookieStore.set(COOKIE_NAME, serializeCart(updated), CART_COOKIE_OPTIONS)
  return NextResponse.json(updated)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params

  if (!isValidProductId(productId)) {
    return NextResponse.json({ error: 'invalid productId' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const items = parseCart(cookieStore.get(COOKIE_NAME)?.value)
  const updated = removeFromCart(items, productId)

  cookieStore.set(COOKIE_NAME, serializeCart(updated), CART_COOKIE_OPTIONS)
  return NextResponse.json(updated)
}
