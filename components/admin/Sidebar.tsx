'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ─── Icons ────────────────────────────────────────────────────────────────────
const I = ({ d, d2 }: { d: string; d2?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
    <path d={d}/>{d2 && <path d={d2}/>}
  </svg>
)

const icons: Record<string, React.ReactNode> = {
  Dashboard: <I d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>,
  Products:  <I d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>,
  Categories:<I d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/>,
  Stock:     <I d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>,
  Orders:    <I d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>,
  Customers: <I d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" d2="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z"/>,
  Blog:      <I d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" d2="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>,
  Flows:     <I d="M13 10V3L4 14h7v7l9-11h-7z"/>,
  Coupons:   <I d="M9 14l1-1m3-3l1-1M7 4v2m10-2v2M5 8H3m18 0h-2M4 12H2m20 0h-2m-4 6v2M8 18v2m4-2v2" d2="M12 3a9 9 0 100 18A9 9 0 0012 3z"/>,
  Reviews:   <I d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>,
  Settings:  <I d="M12 15a3 3 0 100-6 3 3 0 000 6z" d2="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>,
}

const navItems = [
  { href: '/admin',            label: 'Dashboard',  exact: true },
  { href: '/admin/products',   label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/stock',      label: 'Stock' },
  { href: '/admin/orders',     label: 'Orders' },
  { href: '/admin/customers',  label: 'Customers' },
  { href: '/admin/blog',       label: 'Blog' },
  { href: '/admin/flows',      label: 'Flows' },
  { href: '/admin/coupons',    label: 'Coupons' },
  { href: '/admin/reviews',    label: 'Reviews' },
  { href: '/admin/settings',   label: 'Settings' },
]

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="flex flex-col h-full w-64 bg-[#1A3526] select-none">

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-[18px] border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-[#C8994A] flex items-center justify-center shrink-0">
          <svg viewBox="0 0 12 14" fill="white" className="w-3 h-3.5">
            <path d="M6 0C2.5 0 0 2.8 0 5.5c0 1.8.7 3.4 2.2 4.5C2.2 8 3.5 6.8 6 6.8s3.8 1.2 3.8 3.2C11.3 8.9 12 7.3 12 5.5 12 2.8 9.5 0 6 0z"/>
            <path d="M6 7.8C4.2 7.8 3 9 3 10.5 3 12 4.2 13.2 6 14c1.8-.8 3-2 3-3.5S7.8 7.8 6 7.8z" opacity="0.65"/>
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-white leading-tight">Twine Organics</p>
          <p className="text-[10px] text-white/35 tracking-widest uppercase leading-tight mt-0.5">Admin</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-white/35 hover:text-white transition-colors lg:hidden p-0.5">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-4 h-4">
              <path d="M4 4l12 12M16 4L4 16"/>
            </svg>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                active
                  ? 'bg-white/12 text-white'
                  : 'text-white/55 hover:bg-white/7 hover:text-white'
              }`}
            >
              <span className={`transition-colors ${active ? 'text-[#C8994A]' : 'text-white/35 group-hover:text-white/60'}`}>
                {icons[label]}
              </span>
              <span>{label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C8994A] shrink-0" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10">
        <Link
          href="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-white/40 hover:text-white hover:bg-white/7 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] shrink-0">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          View store
        </Link>
      </div>
    </aside>
  )
}
