import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'My Account' }

export default async function AccountPage() {
  const session = await auth()
  if (!session) redirect('/account/login')

  const initial = session.user.name?.[0]?.toUpperCase() ?? '?'

  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#FAF8F3]">
      {/* Header strip */}
      <div className="bg-[#1A3526]">
        <div className="mx-auto max-w-2xl px-6 py-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#C8994A] flex items-center justify-center shrink-0 shadow-sm">
              <span className="font-serif text-2xl text-white font-semibold leading-none">{initial}</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white leading-tight">{session.user.name}</h1>
              <p className="text-sm text-white/50 mt-0.5">{session.user.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav cards */}
      <div className="mx-auto max-w-2xl px-6 py-8 space-y-3">
        <Link
          href="/account/orders"
          className="group flex items-center justify-between rounded-2xl border border-[#E8E3D9] bg-white px-6 py-5 hover:border-[#2D5A3D]/40 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] border border-[#E8E3D9] flex items-center justify-center shrink-0 group-hover:bg-[#1A3526]/5 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1A3526" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#1A1A18] text-sm">My Orders</p>
              <p className="text-xs text-[#9A9A94] mt-0.5">View order history &amp; status</p>
            </div>
          </div>
          <svg viewBox="0 0 20 20" fill="none" stroke="#C5C2BB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 group-hover:stroke-[#1A3526] transition-colors">
            <path d="M7 5l5 5-5 5"/>
          </svg>
        </Link>

        <Link
          href="/account/profile"
          className="group flex items-center justify-between rounded-2xl border border-[#E8E3D9] bg-white px-6 py-5 hover:border-[#2D5A3D]/40 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] border border-[#E8E3D9] flex items-center justify-center shrink-0 group-hover:bg-[#1A3526]/5 transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1A3526" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-[#1A1A18] text-sm">Profile</p>
              <p className="text-xs text-[#9A9A94] mt-0.5">Your account details</p>
            </div>
          </div>
          <svg viewBox="0 0 20 20" fill="none" stroke="#C5C2BB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 group-hover:stroke-[#1A3526] transition-colors">
            <path d="M7 5l5 5-5 5"/>
          </svg>
        </Link>

        {session.user.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="group flex items-center justify-between rounded-2xl border border-[#C8994A]/30 bg-[#C8994A]/5 px-6 py-5 hover:border-[#C8994A]/60 hover:bg-[#C8994A]/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#C8994A]/15 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="#C8994A" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <rect x="3" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="14" y="14" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-[#7A5C2A] text-sm">Admin Dashboard</p>
                <p className="text-xs text-[#C8994A]/70 mt-0.5">Manage the store</p>
              </div>
            </div>
            <svg viewBox="0 0 20 20" fill="none" stroke="#C8994A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0 opacity-60">
              <path d="M7 5l5 5-5 5"/>
            </svg>
          </Link>
        )}

        <div className="pt-4">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-sm text-[#9A9A94] hover:text-red-500 transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
