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
}

export default function CheckoutForm({ items, subtotal }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      {/* Address form */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Delivery address</h2>
        {error && (
          <p className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { id: 'fullName', label: 'Full name', type: 'text' },
            { id: 'addressLine1', label: 'Address', type: 'text' },
            { id: 'city', label: 'City', type: 'text' },
            { id: 'province', label: 'Province', type: 'text' },
            { id: 'postalCode', label: 'Postal code', type: 'text' },
            { id: 'phone', label: 'Phone number', type: 'tel' },
          ].map(({ id, label, type }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                id={id}
                name={id}
                type={type}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-700 px-6 py-3 font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {loading ? 'Redirecting to payment…' : `Pay R${subtotal.toFixed(2)}`}
          </button>
        </form>
      </div>

      {/* Order summary */}
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
