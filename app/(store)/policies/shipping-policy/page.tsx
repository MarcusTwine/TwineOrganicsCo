import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Shipping Policy',
  description: 'Shipping times, costs, and tracking information for Twine Organics orders.',
}

export default function ShippingPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-forest">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Shipping Policy</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">Shipping Policy</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Processing Times</h2>
          <p>
            Please allow 3–5 working days for local orders to be shipped. International shipments are processed within one business day, though final delivery depends on the courier service.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Shipping Costs</h2>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>South Africa — orders under R400:</strong> flat rate of R50.
            </li>
            <li>
              <strong>South Africa — orders R400 and above:</strong> complimentary shipping.
            </li>
            <li>
              <strong>International:</strong> shipping fees are calculated by order weight at checkout.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Delivery &amp; Tracking</h2>
          <p>
            Orders typically ship within 48 hours on weekdays via courier, with standard delivery taking 3–5 business days. Once your order has been fulfilled, you will receive an email containing your waybill tracking number.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Urgent Orders</h2>
          <p>
            If you have a time-sensitive order, please contact us directly so we can discuss your specific requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact Us</h2>
          <p>
            For any shipping-related queries, please reach out at{' '}
            <a href="mailto:info@twineorganicsco.com" className="text-forest hover:underline">
              info@twineorganicsco.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
