'use client'

import { useTransition } from 'react'
import { toggleCoupon, deleteCoupon } from '../actions'

interface Props {
  id: string
  isActive: boolean
  usedCount: number
}

export default function CouponActions({ id, isActive, usedCount }: Props) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        disabled={pending}
        onClick={() => startTransition(() => toggleCoupon(id, !isActive))}
        className={`rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
          isActive
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </button>
      {usedCount === 0 && (
        <button
          disabled={pending}
          onClick={() => {
            if (!confirm('Delete this coupon?')) return
            startTransition(() => deleteCoupon(id))
          }}
          className="rounded px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      )}
    </div>
  )
}
