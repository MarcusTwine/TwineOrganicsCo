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
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 bg-[#FAF8F3]">
        <div className="text-center animate-fade-slide-up">
          <div className="relative inline-flex items-center justify-center w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-[#E8E3D9]" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#1A3526] animate-spin" />
            <svg viewBox="0 0 12 14" fill="#1A3526" className="w-4 h-4 opacity-30">
              <path d="M6 0C2.5 0 0 2.8 0 5.5c0 1.8.7 3.4 2.2 4.5C2.2 8 3.5 6.8 6 6.8s3.8 1.2 3.8 3.2C11.3 8.9 12 7.3 12 5.5 12 2.8 9.5 0 6 0z"/>
            </svg>
          </div>
          <p className="text-sm text-[#6B6B65]">
            {status === 'success' ? 'Signed in — redirecting…' : 'Verifying your link…'}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 bg-[#FAF8F3]">
      <div className="w-full max-w-sm text-center animate-fade-slide-up">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-50 mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
            <circle cx="12" cy="12" r="10"/>
            <path d="M15 9l-6 6M9 9l6 6"/>
          </svg>
        </div>
        <h1 className="font-serif text-3xl text-[#1A1A18] mb-3">Link expired</h1>
        <p className="text-sm text-[#6B6B65] leading-relaxed mb-8">
          This sign-in link is invalid or has already been used. Links expire after 15 minutes.
        </p>
        <Link
          href="/account/login"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1A3526] hover:bg-[#2D5A3D] px-6 py-3 text-sm font-medium text-white transition-colors"
        >
          Request a new link →
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
