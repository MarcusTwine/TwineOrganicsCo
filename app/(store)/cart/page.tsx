import { cookies } from 'next/headers'
import Link from 'next/link'
import type { Metadata } from 'next'
import { parseCart, COOKIE_NAME, cartTotal } from '@/lib/cart'
import { db } from '@/lib/db'
import CartLineItem from '@/components/store/CartLineItem'

export const metadata: Metadata = { title: 'Cart' }

export default async function CartPage() {
  const cookieStore = await cookies()
  const cartItems = parseCart(cookieStore.get(COOKIE_NAME)?.value)

  if (cartItems.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">Your cart is empty</h1>
        <p className="mb-6 text-gray-500">Add some products to get started.</p>
        <Link
          href="/products"
          className="inline-block rounded-md bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800"
        >
          Browse products
        </Link>
      </main>
    )
  }

  // Enrich cart items with product data from DB
  const products = await db.product.findMany({
    where: { id: { in: cartItems.map((i) => i.productId) } },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      stock: true,
    },
  })

  const productMap = Object.fromEntries(products.map((p) => [p.id, p]))

  // Build prices map for cartTotal (price as number)
  const prices = Object.fromEntries(
    products.map((p) => [p.id, Number(p.price)]),
  )

  const subtotal = cartTotal(cartItems, prices)

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Cart</h1>

      <div className="divide-y divide-gray-200 rounded-lg bg-white shadow-sm">
        {cartItems.map((item) => {
          const product = productMap[item.productId]
          if (!product) return null // product may have been deleted
          return (
            <CartLineItem
              key={item.productId}
              productId={item.productId}
              name={product.name}
              price={Number(product.price)}
              quantity={item.quantity}
              imagePath={product.images[0]}
              slug={product.slug}
            />
          )
        })}
      </div>

      {/* Order summary */}
      <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
          <span>Subtotal</span>
          <span>R{subtotal.toFixed(2)}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">Shipping calculated at checkout</p>

        <Link
          href="/checkout"
          className="mt-4 block w-full rounded-md bg-green-700 px-6 py-3 text-center font-medium text-white hover:bg-green-800"
        >
          Proceed to checkout
        </Link>

        <Link
          href="/products"
          className="mt-3 block text-center text-sm text-gray-600 hover:text-green-800"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  )
}
