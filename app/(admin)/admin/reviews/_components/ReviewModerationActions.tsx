'use client'

import { useTransition } from 'react'
import { approveReview, rejectReview, deleteReview } from '../actions'

interface Props {
  id: string
  isApproved: boolean
}

export default function ReviewModerationActions({ id, isApproved }: Props) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center justify-end gap-2">
      {!isApproved ? (
        <button
          disabled={pending}
          onClick={() => startTransition(() => approveReview(id))}
          className="rounded px-2.5 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
        >
          Approve
        </button>
      ) : (
        <button
          disabled={pending}
          onClick={() => startTransition(() => rejectReview(id))}
          className="rounded px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
        >
          Unpublish
        </button>
      )}
      <button
        disabled={pending}
        onClick={() => {
          if (!confirm('Permanently delete this review?')) return
          startTransition(() => deleteReview(id))
        }}
        className="rounded px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  )
}
