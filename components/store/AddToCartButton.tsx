'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  productId: string
  productName: string
  stock: number
}

export default function AddToCartButton({ productId, productName, stock }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [status, setStatus] = useState<'idle' | 'adding' | 'added' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const max = Math.min(stock, 99)

  async function handleClick() {
    if (status === 'adding') return
    if (timerRef.current) clearTimeout(timerRef.current)
    setStatus('adding')
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      })
      if (!res.ok) throw new Error(`Cart error: ${res.status}`)
      setStatus('added')
      timerRef.current = setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') console.error('[AddToCart]', err)
      setStatus('error')
      timerRef.current = setTimeout(() => setStatus('idle'), 2000)
    }
  }

  const labels = {
    idle: 'Add to cart',
    adding: 'Adding…',
    added: '✓ Added to cart',
    error: 'Failed — try again',
  }

  return (
    <div className="space-y-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <label htmlFor={`qty-${productId}`} className="text-sm font-medium text-gray-700">
          Quantity
        </label>
        <div className="flex items-center rounded-md border border-gray-300">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || status === 'adding'}
            aria-label="Decrease quantity"
            className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            −
          </button>
          <input
            id={`qty-${productId}`}
            type="number"
            min={1}
            max={max}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10)
              if (!isNaN(val)) setQuantity(Math.min(max, Math.max(1, val)))
            }}
            className="w-12 border-x border-gray-300 bg-white py-2 text-center text-sm font-medium text-gray-900 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(max, q + 1))}
            disabled={quantity >= max || status === 'adding'}
            aria-label="Increase quantity"
            className="flex h-10 w-10 items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            +
          </button>
        </div>
        {max < 10 && (
          <span className="text-xs text-amber-600">{max} left in stock</span>
        )}
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleClick}
        disabled={status === 'adding'}
        aria-label={`Add ${productName} to cart`}
        className="w-full rounded-md bg-forest px-6 py-3 font-medium text-white transition-colors hover:bg-forest disabled:opacity-50"
      >
        {labels[status]}
      </button>
    </div>
  )
}
