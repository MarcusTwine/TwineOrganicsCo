import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Sidebar from '@/components/admin/Sidebar'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Admin — Twine Organics', template: '%s | Admin' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen flex-col bg-gray-50`}>
        <header className="border-b border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
          <span className="font-semibold text-green-800">Twine Organics — Admin</span>
          <Link
            href="/"
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-green-700 hover:text-green-800 transition-colors"
          >
            ← View Store
          </Link>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
