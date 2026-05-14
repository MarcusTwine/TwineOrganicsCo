'use client'

import { useEffect, useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const next  = searchParams.get('next') ?? '/account'
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    if (!token) { setStatus('error'); return }

    signIn('credentials', { token, redirect: false }).then((result) => {
      if (result?.ok) {
        setStatus('success')
        router.replace(next)
        router.refresh()
      } else {
        setStatus('error')
      }
    })
  }, [token, next, router])

  if (status === 'verifying' || status === 'success') {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-green-700 border-t-transparent" />
          <p className="text-gray-600">
            {status === 'success' ? 'Signed in! Redirecting…' : 'Verifying your link…'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <p className="mb-2 text-4xl">✕</p>
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">Link expired</h1>
        <p className="mb-6 text-gray-600">
          This sign-in link is invalid or has already been used.
          Links expire after 15 minutes.
        </p>
        <Link
          href="/account/login"
          className="inline-block rounded-md bg-green-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-800"
        >
          Request a new link
        </Link>
      </div>
    </main>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  )
}
