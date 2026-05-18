'use client'

import { useState, useCallback } from 'react'
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
  user: {
    id: string
    email: string
    name: string
    phone?: string | null
    addressLine1?: string | null
    addressLine2?: string | null
    city?: string | null
    province?: string | null
    postalCode?: string | null
  } | null
}

interface AppliedCoupon {
  couponId: string
  code: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  discountAmount: number
}

export default function CheckoutForm({ items, subtotal, user }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [createAccount, setCreateAccount] = useState(true)
  const [subscribe, setSubscribe] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

  const total = appliedCoupon ? Math.max(0, subtotal - appliedCoupon.discountAmount) : subtotal

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return
    setCouponError('')
    setCouponLoading(true)
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: couponCode.trim(), orderTotal: subtotal }),
    })
    const data = await res.json()
    setCouponLoading(false)
    if (!res.ok) {
      setCouponError(data.error ?? 'Invalid coupon code.')
      setAppliedCoupon(null)
    } else {
      setAppliedCoupon(data)
      setCouponError('')
    }
  }, [couponCode, subtotal])

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null)
    setCouponCode('')
    setCouponError('')
  }, [])

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
          fullName:     form.get('fullName'),
          addressLine1: form.get('addressLine1'),
          addressLine2: form.get('addressLine2') || undefined,
          city:         form.get('city'),
          province:     form.get('province'),
          postalCode:   form.get('postalCode'),
          phone:        form.get('phone'),
        },
        couponCode: appliedCoupon?.code ?? '',
        // Guest-only fields (ignored when user is logged in server-side)
        email: form.get('email'),
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none"
              />
            </div>
          )}

          {/* Delivery address */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Delivery address</h2>
              {user && (user.addressLine1 || user.city) && (
                <a href="/account/profile" className="text-xs text-forest hover:underline">
                  Edit saved address
                </a>
              )}
            </div>
            <div className="space-y-4">
              {[
                { id: 'fullName',     label: 'Full name',    type: 'text', autocomplete: 'name',           value: user?.name ?? '' },
                { id: 'addressLine1', label: 'Address',      type: 'text', autocomplete: 'street-address', value: user?.addressLine1 ?? '' },
                { id: 'addressLine2', label: 'Address line 2 (optional)', type: 'text', autocomplete: 'address-line2', value: user?.addressLine2 ?? '', required: false },
                { id: 'city',         label: 'City',         type: 'text', autocomplete: 'address-level2', value: user?.city ?? '' },
                { id: 'province',     label: 'Province',     type: 'text', autocomplete: 'address-level1', value: user?.province ?? '' },
                { id: 'postalCode',   label: 'Postal code',  type: 'text', autocomplete: 'postal-code',    value: user?.postalCode ?? '' },
                { id: 'phone',        label: 'Phone number', type: 'tel',  autocomplete: 'tel',            value: user?.phone ?? '' },
              ].map(({ id, label, type, autocomplete, value, required: req = true }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-medium text-gray-700">
                    {label}
                  </label>
                  <input
                    id={id}
                    name={id}
                    type={type}
                    required={req}
                    autoComplete={autocomplete}
                    defaultValue={value}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Coupon code */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Coupon code</h2>
            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {appliedCoupon.code} applied
                  </p>
                  <p className="text-xs text-green-600">
                    {appliedCoupon.discountType === 'PERCENTAGE'
                      ? `${appliedCoupon.discountValue}% off`
                      : `R${appliedCoupon.discountValue.toFixed(2)} off`}
                    {' '}— saving R{appliedCoupon.discountAmount.toFixed(2)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="ml-4 text-xs text-green-700 underline hover:text-green-900"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                  placeholder="Enter coupon code"
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {couponLoading ? 'Checking…' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && (
              <p className="mt-2 text-sm text-red-600">{couponError}</p>
            )}
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
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-forest focus:ring-forest"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-medium">Create an account</span> — save your details
                  for faster checkout next time
                </span>
              </label>

              {createAccount && (
                <p className="ml-7 text-xs text-gray-500">
                  We&apos;ll email you a sign-in link after your order is placed.
                </p>
              )}

              {/* Newsletter */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={subscribe}
                  onChange={(e) => setSubscribe(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-forest focus:ring-forest"
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
            className="w-full rounded-md bg-forest px-6 py-3 font-medium text-white hover:bg-forest disabled:opacity-50"
          >
            {loading ? 'Redirecting to payment…' : `Pay R${total.toFixed(2)}`}
          </button>

          {!user && (
            <p className="text-center text-xs text-gray-500">
              Already have an account?{' '}
              <a href="/account/login?next=/checkout" className="text-forest hover:underline">
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
          {appliedCoupon && (
            <div className="flex items-center justify-between px-4 py-3 text-sm text-green-700">
              <span>Discount ({appliedCoupon.code})</span>
              <span>−R{appliedCoupon.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between p-4 font-semibold text-gray-900">
            <span>Total</span>
            <span>R{total.toFixed(2)}</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          You will be redirected to Peach Payments to complete your payment securely.
        </p>
      </div>
    </div>
  )
}
