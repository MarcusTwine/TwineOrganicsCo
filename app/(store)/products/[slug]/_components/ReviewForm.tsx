'use client'

import { useActionState, useEffect, useState } from 'react'

type State = { error: string; success: boolean }

interface Props {
  action: (prev: State, fd: FormData) => Promise<State>
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
        >
          <span className={(hovered || value) >= star ? 'text-amber-400' : 'text-gray-200'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

export default function ReviewForm({ action }: Props) {
  const [rating, setRating] = useState(0)
  const [state, formAction, pending] = useActionState(action, { error: '', success: false })

  useEffect(() => {
    if (state.success) setRating(0)
  }, [state.success])

  if (state.success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
        Thank you for your review! It will appear once approved.
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden rating field */}
      <input type="hidden" name="rating" value={rating} />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your rating</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div>
        <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="review-title"
          name="title"
          type="text"
          placeholder="Summarise your experience"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="review-body" className="block text-sm font-medium text-gray-700 mb-1">
          Review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          rows={4}
          placeholder="Share your thoughts on this product…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none resize-none"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending || rating === 0}
        className="rounded-lg bg-forest px-5 py-2.5 text-sm font-medium text-white hover:bg-forest disabled:opacity-50"
      >
        {pending ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  )
}
