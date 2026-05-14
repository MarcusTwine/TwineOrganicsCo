import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/account/login')

  const initial = session.user.name?.[0]?.toUpperCase() ?? '?'

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#FAF8F3]">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/account" className="text-[#9A9A94] hover:text-[#1A3526] transition-colors">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M13 15l-5-5 5-5"/>
            </svg>
          </Link>
          <h1 className="font-serif text-2xl text-[#1A1A18]">Profile</h1>
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 rounded-2xl border border-[#E8E3D9] bg-white px-6 py-5">
          <div className="w-16 h-16 rounded-full bg-[#1A3526] flex items-center justify-center shrink-0">
            <span className="font-serif text-2xl text-white font-semibold leading-none">{initial}</span>
          </div>
          <div>
            <p className="font-semibold text-[#1A1A18]">{session.user.name}</p>
            <p className="text-sm text-[#6B6B65] mt-0.5">{session.user.email}</p>
            <span className="inline-block mt-2 rounded-full bg-[#1A3526]/8 px-2.5 py-0.5 text-[11px] font-medium text-[#1A3526] capitalize">
              {session.user.role.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="rounded-2xl border border-[#E8E3D9] bg-white overflow-hidden">
          {[
            { label: 'Full name', value: session.user.name },
            { label: 'Email address', value: session.user.email },
            { label: 'Account type', value: session.user.role.charAt(0) + session.user.role.slice(1).toLowerCase() },
          ].map(({ label, value }, i, arr) => (
            <div key={label} className={`flex items-center justify-between px-6 py-4 ${i < arr.length - 1 ? 'border-b border-[#E8E3D9]' : ''}`}>
              <span className="text-xs font-semibold text-[#9A9A94] uppercase tracking-wider">{label}</span>
              <span className="text-sm text-[#1A1A18] font-medium">{value}</span>
            </div>
          ))}
        </div>

        <p className="mt-6 text-xs text-[#9A9A94] text-center">
          Sign in links are sent by email — no password required.
        </p>
      </div>
    </main>
  )
}
