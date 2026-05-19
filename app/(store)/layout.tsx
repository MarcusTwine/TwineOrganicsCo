import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import WhatsAppButton from '@/components/store/WhatsAppButton'
import { getSetting } from '@/lib/settings'
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

const adam = localFont({
  src: [
    {
      path: '../../components/fonts/adam/Adam-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../components/fonts/adam/Adam-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../components/fonts/adam/Adam-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-adam',
  display: 'swap',
})

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { default: 'Twine Organics', template: '%s | Twine Organics' },
  description: 'Premium organic products.',
}

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const whatsappPhone = await getSetting('whatsapp_phone')

  return (
    <html lang="en">
      <body className={`${ttChocolates.variable} ${adam.variable} flex min-h-screen flex-col bg-white font-sans`}>
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        {whatsappPhone && <WhatsAppButton phone={whatsappPhone} />}
      </body>
    </html>
  )
}
