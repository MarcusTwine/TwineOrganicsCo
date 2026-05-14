import type { Metadata } from 'next'
import PeachWidget from './PeachWidget'

export const metadata: Metadata = { title: 'Payment' }

interface Props {
  searchParams: Promise<{
    checkoutId?: string
    orderId?: string
    scriptUrl?: string
    resultUrl?: string
  }>
}

export default async function PaymentPage({ searchParams }: Props) {
  const { checkoutId, orderId, scriptUrl, resultUrl } = await searchParams

  if (!checkoutId || !orderId || !scriptUrl || !resultUrl) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600">Invalid payment session.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Secure payment</h1>
      <p className="mb-8 text-sm text-gray-500">
        Complete your payment below. Your connection is encrypted.
      </p>
      <PeachWidget
        scriptUrl={decodeURIComponent(scriptUrl)}
        resultUrl={decodeURIComponent(resultUrl)}
      />
    </main>
  )
}
