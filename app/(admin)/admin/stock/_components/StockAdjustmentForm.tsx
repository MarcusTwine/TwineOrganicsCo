'use client'

import { useActionState } from 'react'
import { adjustStock } from '../actions'

interface Props { productId: string }

const REASONS = ['RESTOCK', 'SALE', 'DAMAGED', 'CORRECTION', 'OTHER']

export default function StockAdjustmentForm({ productId }: Props) {
  const boundAction = adjustStock.bind(null, productId)
  const [state, formAction, pending] = useActionState(boundAction, { error: '', success: false })

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
        <div className="flex gap-4">
          {['ADD', 'REMOVE'].map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="type" value={t} defaultChecked={t === 'ADD'} className="text-green-600" />
              <span className="text-sm text-gray-700">{t === 'ADD' ? 'Add stock' : 'Remove stock'}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input
          name="quantity"
          type="number"
          min="1"
          required
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
        <select
          name="reason"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        >
          {REASONS.map((r) => (
            <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
        <textarea
          name="note"
          rows={2}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none resize-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">Adjustment saved!</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-green-700 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save adjustment'}
      </button>
    </form>
  )
}
