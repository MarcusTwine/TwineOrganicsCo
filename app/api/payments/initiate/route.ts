import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'
import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendMagicLinkEmail } from '@/lib/email'
import { createCheckout } from '@/lib/peach'
import { COOKIE_NAME, CART_COOKIE_OPTIONS } from '@/lib/cart'

type CartItem = { productId: string; quantity: number }
type DeliveryAddress = {
  fullName: string; addressLine1: string; city: string
  province: string; postalCode: string; phone: string
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

  // ── Resolve user ──────────────────────────────────────────────────────────
  let userId: string
  let guestEmail: string | null = null

  if (session?.user?.id) {
    userId = session.user.id
  } else {
    const rawEmail = body?.email
    if (typeof rawEmail !== 'string' || !rawEmail.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const email = rawEmail.toLowerCase().trim()
    guestEmail = email
    const createAccount: boolean = body?.createAccount === true
    const subscribe:     boolean = body?.subscribe === true

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      userId = existing.id
    } else {
      const newUser = await db.user.create({
        data: { name: fullName, email, role: 'CUSTOMER' },
      })
      userId = newUser.id
    }

    if (subscribe) {
      await db.newsletterSubscription.upsert({
        where: { email },
        create: { email },
        update: { active: true },
      })
    }

    // Send magic link so they can access their account / order history
    if (createAccount) {
      try {
        const plain     = randomBytes(32).toString('hex')
        const hash      = createHash('sha256').update(plain).digest('hex')
        const expiresAt = new Date(Date.now() + 15 * 60_000)
        await db.magicLinkToken.create({ data: { userId, token: hash, expiresAt } })
        const siteUrl   = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''
        const magicLink = `${siteUrl}/account/verify?token=${plain}&next=/account/orders`
        await sendMagicLinkEmail(email, magicLink)
      } catch {
        // Non-fatal — order proceeds even if magic link email fails
      }
    }
  }

  // ── Validate products ─────────────────────────────────────────────────────
  const productIds = cartItems.map((i) => i.productId)
  const products   = await db.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, price: true, stock: true, isActive: true },
  })
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  for (const item of cartItems) {
    const product = productMap[item.productId]
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'One or more products are unavailable.' }, { status: 409 })
    }
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: 'Insufficient stock for one or more items.' }, { status: 409 })
    }
  }

  const total = cartItems.reduce(
    (sum, item) => sum + Number(productMap[item.productId].price) * item.quantity,
    0,
  )

  // ── Create order ──────────────────────────────────────────────────────────
  const order = await db.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: { userId, status: 'PENDING', total, deliveryAddress: address },
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

  // ── Initiate Peach V2 hosted checkout ────────────────────────────────────
  const siteUrl          = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? ''
  const shopperResultUrl = `${siteUrl}/checkout/result?orderId=${order.id}`

  let redirectUrl: string
  try {
    const { redirectUrl: peachUrl, checkoutId } = await createCheckout({
      amount: total,
      currency: 'ZAR',
      orderId: order.id,
      shopperResultUrl,
    })

    if (checkoutId) {
      await db.order.update({ where: { id: order.id }, data: { peachPaymentId: checkoutId } })
    }

    redirectUrl = peachUrl
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment service unavailable.'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // Clear cart cookie
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, '', { ...CART_COOKIE_OPTIONS, maxAge: 0 })

  return NextResponse.json({ redirectUrl })
}
