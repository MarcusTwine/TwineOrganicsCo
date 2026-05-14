'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function BotanicalSVG() {
  return (
    <svg viewBox="0 0 320 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <ellipse cx="160" cy="240" rx="105" ry="165" fill="rgba(255,255,255,0.018)" transform="rotate(-10 160 240)"/>
      <path d="M160 445 C160 445 118 342 100 258 C82 174 122 110 160 64 C198 110 238 174 220 258 C202 342 160 445 160 445Z"
        stroke="rgba(255,255,255,0.20)" strokeWidth="1.4" fill="rgba(255,255,255,0.032)"/>
      <path d="M160 445 L160 64" stroke="rgba(255,255,255,0.11)" strokeWidth="0.9"/>
      <path d="M152 176 C134 165 116 162 97 165" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
      <path d="M145 224 C127 214 109 212 89 216" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
      <path d="M139 272 C121 268 105 268 86 274" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
      <path d="M140 320 C124 317 110 319 94 326" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
      <path d="M148 368 C134 367 121 370 109 377" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
      <path d="M168 176 C186 165 204 162 223 165" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
      <path d="M175 224 C193 214 211 212 231 216" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
      <path d="M181 272 C199 268 215 268 234 274" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
      <path d="M180 320 C196 317 210 319 226 326" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
      <path d="M172 368 C186 367 199 370 211 377" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8"/>
      <path d="M65 158 C65 158 46 135 42 115 C38 95 52 83 65 78 C78 83 88 95 84 115 C80 135 65 158 65 158Z"
        stroke="rgba(255,255,255,0.13)" strokeWidth="1" fill="rgba(255,255,255,0.022)"/>
      <path d="M65 158 L65 78" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6"/>
      <path d="M259 310 C259 310 279 284 286 263 C293 242 281 229 267 224 C253 229 244 242 248 263 C252 284 259 310 259 310Z"
        stroke="rgba(255,255,255,0.13)" strokeWidth="1" fill="rgba(255,255,255,0.022)"/>
      <path d="M259 310 L267 224" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6"/>
      <circle cx="88" cy="395" r="11" stroke="rgba(255,255,255,0.055)" strokeWidth="1" fill="none"/>
      <circle cx="88" cy="395" r="6.5" stroke="rgba(255,255,255,0.04)" strokeWidth="0.7" fill="none"/>
      <circle cx="242" cy="120" r="9" stroke="rgba(255,255,255,0.055)" strokeWidth="1" fill="none"/>
      <circle cx="242" cy="120" r="5" stroke="rgba(255,255,255,0.04)" strokeWidth="0.7" fill="none"/>
      <circle cx="121" cy="96" r="2" fill="rgba(255,255,255,0.14)"/>
      <circle cx="200" cy="112" r="1.5" fill="rgba(255,255,255,0.10)"/>
      <circle cx="75" cy="230" r="1.3" fill="rgba(255,255,255,0.09)"/>
      <circle cx="258" cy="265" r="1.8" fill="rgba(255,255,255,0.12)"/>
      <circle cx="50" cy="304" r="1.1" fill="rgba(255,255,255,0.08)"/>
      <circle cx="280" cy="355" r="1.5" fill="rgba(255,255,255,0.10)"/>
      <circle cx="274" cy="412" r="1.2" fill="rgba(255,255,255,0.09)"/>
    </svg>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/account'
  const [email, setEmail] = useState('')
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

  return (
    <div className="flex min-h-screen">

      {/* ── Brand panel ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-[44%] flex-col bg-[#1A3526] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A3526] to-[#0D1F15]" />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[260px] animate-float-leaf">
            <BotanicalSVG />
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 p-8">
          <div className="w-7 h-7 bg-[#C8994A] rounded-md flex items-center justify-center shrink-0">
            <svg viewBox="0 0 12 14" fill="white" className="w-3 h-3.5">
              <path d="M6 0C2.5 0 0 2.8 0 5.5c0 1.8.7 3.4 2.2 4.5C2.2 8 3.5 6.8 6 6.8s3.8 1.2 3.8 3.2C11.3 8.9 12 7.3 12 5.5 12 2.8 9.5 0 6 0z"/>
              <path d="M6 7.8C4.2 7.8 3 9 3 10.5 3 12 4.2 13.2 6 14c1.8-.8 3-2 3-3.5S7.8 7.8 6 7.8z" opacity="0.65"/>
            </svg>
          </div>
          <span className="text-white/45 text-xs tracking-[0.24em] uppercase font-light">Twine Organics</span>
        </div>

        <div className="relative z-10 mt-auto p-8 pb-10">
          <h2 className="font-serif text-[2.5rem] leading-[1.18] text-white mb-4">
            Nature&apos;s finest,<br />
            <em className="text-[#C8994A] not-italic">delivered</em> to you.
          </h2>
          <p className="text-sm leading-relaxed text-white/40 max-w-[230px]">
            Premium organic products sourced with care for your wellbeing and our planet.
          </p>
          <p className="mt-10 text-[11px] text-white/20">© {new Date().getFullYear()} Twine Organics</p>
        </div>
      </div>

      {/* ── Form panel ────────────────────────────── */}
      <div className="flex flex-1 flex-col bg-[#FAF8F3]">

        <div className="lg:hidden flex items-center gap-2.5 px-6 py-4 border-b border-[#E8E3D9]">
          <div className="w-6 h-6 bg-[#1A3526] rounded flex items-center justify-center shrink-0">
            <svg viewBox="0 0 12 14" fill="white" className="w-2.5 h-3">
              <path d="M6 0C2.5 0 0 2.8 0 5.5c0 1.8.7 3.4 2.2 4.5C2.2 8 3.5 6.8 6 6.8s3.8 1.2 3.8 3.2C11.3 8.9 12 7.3 12 5.5 12 2.8 9.5 0 6 0z"/>
            </svg>
          </div>
          <span className="text-[#1A3526] text-sm font-semibold">Twine Organics</span>
        </div>

        <div className="flex flex-1 items-center justify-center px-8 py-12">
          <div className="w-full max-w-[360px]">

            {status === 'sent' ? (
              <div className="text-center animate-fade-slide-up">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1A3526]/10 mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#1A3526" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h1 className="font-serif text-3xl text-[#1A1A18] mb-3">Check your inbox</h1>
                <p className="text-sm text-[#6B6B65] leading-relaxed">We sent a sign-in link to</p>
                <p className="text-sm font-medium text-[#1A1A18] mt-0.5">{email}</p>
                <p className="text-xs text-[#9A9A94] mt-2 mb-8">The link expires in 15 minutes.</p>
                <button
                  onClick={() => setStatus('idle')}
                  className="text-sm text-[#2D5A3D] underline underline-offset-4 hover:text-[#1A3526] transition-colors"
                >
                  Use a different email
                </button>
              </div>
            ) : (
              <div className="animate-fade-slide-up">
                <h1 className="font-serif text-4xl text-[#1A1A18] mb-2">Welcome back</h1>
                <p className="text-sm text-[#6B6B65] leading-relaxed mb-8">
                  Enter your email and we&apos;ll send you a magic sign-in link. No password needed.
                </p>

                {status === 'error' && (
                  <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50/70 px-4 py-3 mb-5">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-500 shrink-0">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-sm text-red-700">Something went wrong. Please try again.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-[11px] font-semibold text-[#9A9A94] uppercase tracking-widest mb-2">
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
                      placeholder="you@example.com"
                      className="block w-full rounded-xl border border-[#E8E3D9] bg-white px-4 py-3.5 text-sm text-[#1A1A18] placeholder:text-[#C5C2BB] focus:border-[#2D5A3D] focus:outline-none focus:ring-2 focus:ring-[#2D5A3D]/10 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="w-full rounded-xl bg-[#1A3526] hover:bg-[#2D5A3D] px-4 py-3.5 text-sm font-medium text-white transition-colors duration-150 active:scale-[0.98] disabled:opacity-55"
                  >
                    {status === 'sending' ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Sending…
                      </span>
                    ) : 'Send sign-in link →'}
                  </button>
                </form>

                <p className="mt-7 text-center text-xs text-[#9A9A94]">
                  New here? No registration needed — your account is created automatically.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
