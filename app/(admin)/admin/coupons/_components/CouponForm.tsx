'use client'

import { useActionState, useEffect, useRef } from 'react'

type State = { error: string; success: boolean }

interface Props {
  action: (prev: State, fd: FormData) => Promise<State>
}

export default function CouponForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: '', success: false })
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Code <span className="text-red-500">*</span>
        </label>
        <input
          name="code"
          required
          placeholder="e.g. SUMMER20"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase focus:border-forest focus:outline-none"
          style={{ textTransform: 'uppercase' }}
        />
        <p className="mt-1 text-xs text-gray-400">Letters, numbers, hyphens, underscores only</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          name="description"
          placeholder="e.g. Summer sale 20% off"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            name="discountType"
            required
            defaultValue="PERCENTAGE"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          >
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed (R)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Value <span className="text-red-500">*</span>
          </label>
          <input
            name="discountValue"
            type="number"
            required
            min="0.01"
            step="0.01"
            placeholder="e.g. 20"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min order (R)</label>
          <input
            name="minOrderAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="No minimum"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max uses</label>
          <input
            name="maxUses"
            type="number"
            min="1"
            step="1"
            placeholder="Unlimited"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Expires at</label>
        <input
          name="expiresAt"
          type="datetime-local"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-forest focus:outline-none"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-forest">Coupon created.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-forest py-2 text-sm font-medium text-white hover:bg-forest disabled:opacity-60"
      >
        {pending ? 'Creating…' : 'Create coupon'}
      </button>
    </form>
  )
}
