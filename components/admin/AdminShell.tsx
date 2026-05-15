'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:z-auto lg:shrink-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Main column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="flex items-center gap-3 px-5 py-3 bg-white border-b border-[#E8E3D9] shrink-0">
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-1.5 rounded-md text-[#6B6B65] hover:text-[#1A3526] hover:bg-white transition-colors"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="w-5 h-5">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          {/* Mobile brand (hidden on lg) */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-5 h-5 rounded bg-[#1A3526] flex items-center justify-center">
              <svg viewBox="0 0 12 14" fill="white" className="w-2.5 h-3">
                <path d="M6 0C2.5 0 0 2.8 0 5.5c0 1.8.7 3.4 2.2 4.5C2.2 8 3.5 6.8 6 6.8s3.8 1.2 3.8 3.2C11.3 8.9 12 7.3 12 5.5 12 2.8 9.5 0 6 0z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-[#1A3526]">Admin</span>
          </div>

          <div className="flex-1" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-white p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
