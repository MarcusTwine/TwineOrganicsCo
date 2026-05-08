'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (submitted) {
    return (
      <p className="font-serif text-xl italic text-white">
        Thank you — welcome to the Twine community.
      </p>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error ?? 'Something went wrong. Please try again.')
        return
      }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-md">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 bg-white px-5 py-3.5 text-sm text-stone-900 outline-none placeholder:text-stone-400"
        />
        <button
          type="submit"
          className="bg-[#a07840] px-7 py-3.5 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-[#8a6535]"
        >
          Join
        </button>
      </form>
      {error && (
        <p className="mt-2 text-center text-sm text-red-300">{error}</p>
      )}
    </div>
  )
}
