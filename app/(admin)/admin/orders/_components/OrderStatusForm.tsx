'use client'

import { useActionState } from 'react'
import { updateOrderStatus } from '../actions'

const STATUSES = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'FAILED']

interface Props { orderId: string; currentStatus: string }

export default function OrderStatusForm({ orderId, currentStatus }: Props) {
  const boundAction = updateOrderStatus.bind(null, orderId)
  const [state, formAction, pending] = useActionState(boundAction, { error: '', success: false })

  return (
    <form action={formAction} className="space-y-3">
      <select
        name="status"
        defaultValue={currentStatus}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
        ))}
      </select>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      {state.success && <p className="text-xs text-forest">Status updated</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-forest py-2 text-sm font-medium text-white hover:bg-forest disabled:opacity-60"
      >
        {pending ? 'Updating…' : 'Update status'}
      </button>
    </form>
  )
}
