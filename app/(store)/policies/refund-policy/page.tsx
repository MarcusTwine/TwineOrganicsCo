import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Twine Organics refund and returns policy.',
}

export default function RefundPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-forest">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Refund Policy</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">Refund Policy</h1>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
        <p>
          No refunds will be given on orders once received and in good condition.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">Damaged, Missing or Incorrect Orders</h2>
        <p>
          If your products arrive damaged, missing, or incorrect, please contact us and we will replace your order at no additional fee.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">Unhappy With Your Order?</h2>
        <p>
          Please inform us if you are entirely unhappy with your order and we will make sure to improve our product line and/or our service offering.
        </p>

        <h2 className="text-xl font-semibold text-gray-900">Contact Us</h2>
        <p>
          For any queries regarding your order, please reach out to us at{' '}
          <a href="mailto:support@twineorganicsco.com" className="text-forest hover:underline">
            support@twineorganicsco.com
          </a>
          .
        </p>
      </div>
    </main>
  )
}
