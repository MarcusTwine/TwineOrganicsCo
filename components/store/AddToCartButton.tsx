'use client'

import { useState, useRef, useEffect } from 'react'

interface Props {
  productId: string
  productName: string
}

export default function AddToCartButton({ productId, productName }: Props) {
  const [status, setStatus] = useState<'idle' | 'adding' | 'added' | 'error'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  async function handleClick() {
    if (status === 'adding') return
    if (timerRef.current) clearTimeout(timerRef.current)
    setStatus('adding')
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
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
    <button
      onClick={handleClick}
      disabled={status === 'adding'}
      aria-label={`Add ${productName} to cart`}
      className="w-full rounded-md bg-green-700 px-6 py-3 font-medium text-white transition-colors hover:bg-green-800 disabled:opacity-50"
    >
      {labels[status]}
    </button>
  )
}
