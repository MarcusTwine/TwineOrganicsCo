import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { parseCart, COOKIE_NAME } from '@/lib/cart'
import CheckoutForm from './CheckoutForm'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const session = await auth()

  const cookieStore = await cookies()
  const cartItems = parseCart(cookieStore.get(COOKIE_NAME)?.value)

  if (cartItems.length === 0) {
    redirect('/products')
  }

  const products = await db.product.findMany({
    where: { id: { in: cartItems.map((i) => i.productId) } },
    select: { id: true, name: true, price: true, images: true },
  })

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  const enrichedItems = cartItems
    .filter((i) => productMap[i.productId])
    .map((i) => ({
      ...i,
      product: {
        id: productMap[i.productId].id,
        name: productMap[i.productId].name,
        price: Number(productMap[i.productId].price),
        images: productMap[i.productId].images,
      },
    }))

  if (enrichedItems.length === 0) {
    redirect('/products')
  }

  const subtotal = enrichedItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  )

  const user = session?.user
    ? { id: session.user.id!, email: session.user.email!, name: session.user.name ?? '' }
    : null

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">Checkout</h1>
      <CheckoutForm items={enrichedItems} subtotal={subtotal} user={user} />
    </main>
  )
}
