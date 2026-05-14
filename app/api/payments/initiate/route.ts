import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/hash'
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

  // Resolve which user is placing the order
  let userId: string

  if (session?.user?.id) {
    // Logged-in user
    userId = session.user.id
  } else {
    // Guest checkout — email is required
    const rawEmail = body?.email
    if (typeof rawEmail !== 'string' || !rawEmail.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }
    const email = rawEmail.toLowerCase().trim()
    const createAccount: boolean = body?.createAccount === true
    const password: string | undefined = body?.password
    const subscribe: boolean = body?.subscribe === true

    const existing = await db.user.findUnique({ where: { email } })

    if (existing) {
      // Email already has an account — use it silently
      userId = existing.id
    } else if (createAccount && password && password.length >= 8) {
      // Create a real account
      const hashed = await hashPassword(password)
      const newUser = await db.user.create({
        data: { name: fullName, email, hashedPassword: hashed, role: 'CUSTOMER' },
      })
      userId = newUser.id
    } else {
      // Guest with no account — create a placeholder user so order can be recorded.
      // They can claim it later via "Forgot password".
      const hashed = await hashPassword(crypto.randomUUID())
      const newUser = await db.user.create({
        data: { name: fullName, email, hashedPassword: hashed, role: 'CUSTOMER' },
      })
      userId = newUser.id
    }

    // Newsletter subscription
    if (subscribe) {
      const email2 = rawEmail.toLowerCase().trim()
      await db.newsletterSubscription.upsert({
        where: { email: email2 },
        create: { email: email2 },
        update: { active: true },
      })
    }
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
        userId,
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
