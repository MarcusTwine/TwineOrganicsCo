'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/account'

  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, next }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">
            ✉
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">Check your email</h1>
          <p className="text-gray-600">
            We sent a sign-in link to{' '}
            <span className="font-medium text-gray-900">{email}</span>.
            <br />
            Click the link in the email to continue.
          </p>
          <p className="mt-3 text-sm text-gray-400">Link expires in 15 minutes.</p>
          <button
            onClick={() => setStatus('idle')}
            className="mt-6 text-sm text-green-700 hover:underline"
          >
            Use a different email
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-1 text-2xl font-semibold text-gray-900">Sign in</h1>
        <p className="mb-6 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a sign-in link. No password needed.
        </p>
        {status === 'error' && (
          <p className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700">
            Something went wrong. Please try again.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-md bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending…' : 'Send sign-in link'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-400">
          New here? No registration needed — just enter your email above.
        </p>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
