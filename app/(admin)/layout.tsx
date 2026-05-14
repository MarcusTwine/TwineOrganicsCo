import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import AdminShell from '@/components/admin/AdminShell'
import '../globals.css'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Admin — Twine Organics', template: '%s | Admin' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={jakarta.className}>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  )
}
