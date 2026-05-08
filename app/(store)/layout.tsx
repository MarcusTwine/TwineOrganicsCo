import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Twine Organics', template: '%s | Twine Organics' },
  description: 'Premium organic products.',
}

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex min-h-screen flex-col bg-gray-50`}>
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
