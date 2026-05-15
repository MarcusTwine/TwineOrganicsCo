import type { Metadata } from 'next'
import localFont from 'next/font/local'
import AdminShell from '@/components/admin/AdminShell'
import '../globals.css'

const ttChocolates = localFont({
  src: [
    {
      path: '../../components/fonts/tt_chocolates/TT Chocolates Trial Light.otf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../components/fonts/tt_chocolates/TT Chocolates Trial Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../components/fonts/tt_chocolates/TT Chocolates Trial Medium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../components/fonts/tt_chocolates/TT Chocolates Trial Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-tt-chocolates',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Admin — Twine Organics', template: '%s | Admin' },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${ttChocolates.variable} font-sans`}>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  )
}
