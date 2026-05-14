'use client'

import { useState } from 'react'
import type { CartItem } from '@/lib/cart'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
}

interface EnrichedItem extends CartItem {
  product: Product
}

interface Props {
  items: EnrichedItem[]
  subtotal: number
  user: { id: string; email: string; name: string } | null
}

export default function CheckoutForm({ items, subtotal, user }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createAccount, setCreateAccount] = useState(true)
  const [subscribe, setSubscribe] = useState(true)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)

    const res = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        address: {
          fullName: form.get('fullName'),
          addressLine1: form.get('addressLine1'),
          city: form.get('city'),
          province: form.get('province'),
          postalCode: form.get('postalCode'),
          phone: form.get('phone'),
        },
        // Guest-only fields (ignored when user is logged in server-side)
        email: form.get('email'),
        password: createAccount ? form.get('password') : undefined,
        createAccount: !user && createAccount,
        subscribe: !user && subscribe,
      }),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    const { redirectUrl } = await res.json()
    window.location.href = redirectUrl
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Left column — form */}
      <div>
        {error && (
          <p className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email — guests only */}
          {!user && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Contact details</h2>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          )}

          {/* Delivery address */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Delivery address</h2>
            <div className="space-y-4">
              {[
                { id: 'fullName', label: 'Full name', type: 'text', autocomplete: 'name' },
                { id: 'addressLine1', label: 'Address', type: 'text', autocomplete: 'street-address' },
                { id: 'city', label: 'City', type: 'text', autocomplete: 'address-level2' },
                { id: 'province', label: 'Province', type: 'text', autocomplete: 'address-level1' },
                { id: 'postalCode', label: 'Postal code', type: 'text', autocomplete: 'postal-code' },
                { id: 'phone', label: 'Phone number', type: 'tel', autocomplete: 'tel' },
              ].map(({ id, label, type, autocomplete }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <input
                    id={id}
                    name={id}
                    type={type}
                    required
                    autoComplete={autocomplete}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Account + newsletter options — guests only */}
          {!user && (
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              {/* Create account */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Create an account</span> — save your details
                  for faster checkout next time
                </span>
              </label>

              {createAccount && (
                <div className="ml-7">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required={createAccount}
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Newsletter */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscribe}
                  onChange={(e) => setSubscribe(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-700 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Subscribe to our newsletter</span> — organic tips,
                  new products, and exclusive offers
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? 'Redirecting to payment…' : `Pay R${subtotal.toFixed(2)}`}
          </button>

          {!user && (
            <p className="text-center text-xs text-gray-500">
              Already have an account?{' '}
              <a href="/account/login?next=/checkout" className="text-green-700 hover:underline">
                Sign in
              </a>
            </p>
          )}
        </form>
      </div>

      {/* Right column — order summary */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Order summary</h2>
        <div className="divide-y divide-gray-200 rounded-lg bg-white shadow-sm">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-gray-900">{item.product.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="ml-4 font-medium text-gray-900">
                R{(item.product.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-between p-4 font-semibold text-gray-900">
            <span>Total</span>
            <span>R{subtotal.toFixed(2)}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          You will be redirected to Peach Payments to complete your payment securely.
        </p>
      </div>
    </div>
  )
}
