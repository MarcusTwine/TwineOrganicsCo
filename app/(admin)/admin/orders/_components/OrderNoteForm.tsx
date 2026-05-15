'use client'

import { useActionState, useRef } from 'react'
import { addOrderNote } from '../actions'

interface Props { orderId: string }

export default function OrderNoteForm({ orderId }: Props) {
  const boundAction = addOrderNote.bind(null, orderId)
  const [state, formAction, pending] = useActionState(boundAction, { error: '', success: false })
  const ref = useRef<HTMLFormElement>(null)

  return (
    <form ref={ref} action={formAction} className="space-y-2">
      <textarea
        name="body"
        rows={3}
        placeholder="Add an internal note…"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none resize-none"
      />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-60"
      >
        {pending ? 'Adding…' : 'Add note'}
      </button>
    </form>
  )
}
