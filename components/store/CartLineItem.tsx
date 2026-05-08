'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  productId: string
  name: string
  price: number
  quantity: number
  imagePath: string | undefined
  slug: string
}

export default function CartLineItem({
  productId,
  name,
  price,
  quantity: initialQty,
  imagePath,
  slug,
}: Props) {
  const [quantity, setQuantity] = useState(initialQty)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const pendingRef = useRef(false)

  async function updateQuantity(newQty: number) {
    if (newQty < 0 || pendingRef.current) return
    pendingRef.current = true
    setLoading(true)
    try {
      if (newQty === 0) {
        await fetch(`/api/cart/${productId}`, { method: 'DELETE' })
      } else {
        const res = await fetch(`/api/cart/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQty }),
        })
        if (res.ok) setQuantity(newQty)
      }
    } finally {
      pendingRef.current = false
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <div className="flex items-center gap-4 p-4">
      {/* Thumbnail */}
      <Link
        href={`/products/${slug}`}
        className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-gray-100"
      >
        {imagePath ? (
          <img
            src={imagePath}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-green-50 text-green-200">
            ✦
          </div>
        )}
      </Link>

      {/* Name + price */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/products/${slug}`}
          className="block truncate font-medium text-gray-900 hover:text-green-800"
        >
          {name}
        </Link>
        <p className="text-sm text-gray-500">R{price.toFixed(2)} each</p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(quantity - 1)}
          disabled={loading}
          aria-label="Decrease quantity"
          className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium">{quantity}</span>
        <button
          onClick={() => updateQuantity(quantity + 1)}
          disabled={loading}
          aria-label="Increase quantity"
          className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          +
        </button>
      </div>

      {/* Line total */}
      <p className="w-24 text-right font-medium text-gray-900">
        R{(price * quantity).toFixed(2)}
      </p>

      {/* Remove */}
      <button
        onClick={() => updateQuantity(0)}
        disabled={loading}
        aria-label={`Remove ${name} from cart`}
        className="text-sm text-red-500 hover:text-red-700 disabled:opacity-50"
      >
        Remove
      </button>
    </div>
  )
}
