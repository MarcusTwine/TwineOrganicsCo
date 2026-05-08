'use client'

import { useActionState, useEffect, useRef } from 'react'

type State = { error: string; success: boolean }

interface Props {
  action: (prev: State, fd: FormData) => Promise<State>
}

export default function CategoryForm({ action }: Props) {
  const [state, formAction, pending] = useActionState(action, { error: '', success: false })
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.success) formRef.current?.reset()
  }, [state.success])

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category name</label>
        <input
          name="name"
          required
          placeholder="e.g. Teas, Supplements…"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="text-sm text-green-600">Category created.</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
      >
        {pending ? 'Creating…' : 'Create category'}
      </button>
    </form>
  )
}
