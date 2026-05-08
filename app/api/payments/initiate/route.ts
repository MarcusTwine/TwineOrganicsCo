import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createCheckout } from '@/lib/peach'
import { COOKIE_NAME, CART_COOKIE_OPTIONS } from '@/lib/cart'

type CartItem = { productId: string; quantity: number }
type DeliveryAddress = {
  fullName: string
  addressLine1: string
  city: string
  province: string
  postalCode: string
  phone: string
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const cartItems: CartItem[] = body?.cartItems ?? []
  const address: DeliveryAddress | undefined = body?.address

  if (!cartItems.length || !address) {
    return NextResponse.json({ error: 'Cart and address are required.' }, { status: 400 })
  }

  const { fullName, addressLine1, city, province, postalCode, phone } = address
  if (!fullName || !addressLine1 || !city || !province || !postalCode || !phone) {
    return NextResponse.json({ error: 'All address fields are required.' }, { status: 400 })
  }

  // Re-fetch products server-side — never trust client prices
  const productIds = cartItems.map((i) => i.productId)
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, stock: true, isActive: true },
  })
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  for (const item of cartItems) {
    const product = productMap[item.productId]
    if (!product || !product.isActive) {
      return NextResponse.json(
        { error: 'One or more products are unavailable.' },
        { status: 409 },
      )
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock for one or more items.' },
        { status: 409 },
      )
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + Number(productMap[item.productId].price) * item.quantity,
    0,
  )

  // Create order + items atomically
  const order = await db.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        total,
        deliveryAddress: address,
      },
    })
    await tx.orderItem.createMany({
      data: cartItems.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: Number(productMap[item.productId].price),
      })),
    })
    return newOrder
  })

  // Initiate Peach hosted checkout
  const shopperResultUrl = `${process.env.NEXTAUTH_URL}/checkout/result?orderId=${order.id}`
  let redirectUrl: string

  try {
    const { checkoutId, redirectUrl: url } = await createCheckout({
      amount: total.toFixed(2),
      currency: 'ZAR',
      orderId: order.id,
      shopperResultUrl,
    })

    await db.order.update({
      where: { id: order.id },
      data: { peachPaymentId: checkoutId },
    })

    redirectUrl = url
  } catch {
    return NextResponse.json(
      { error: 'Payment service unavailable. Please try again.' },
      { status: 502 },
    )
  }

  // Clear the cart cookie
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', { ...CART_COOKIE_OPTIONS, maxAge: 0 })

  return NextResponse.json({ redirectUrl })
}
