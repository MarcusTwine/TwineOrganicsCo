import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact Information',
  description: 'Get in touch with Twine Organics Company.',
}

export default function ContactInformationPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-forest">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Contact Information</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">Contact Information</h1>

      <div className="space-y-6 text-gray-700">
        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Business Details</h2>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium text-gray-900">Trade Name</dt>
              <dd>Twine Organics Company</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Physical Address</dt>
              <dd>George, Western Cape, 6529, South Africa</dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Get in Touch</h2>
          <p>
            Email us at{' '}
            <a href="mailto:info@twineorganicsco.com" className="text-forest hover:underline">
              info@twineorganicsco.com
            </a>{' '}
            and we will get back to you as soon as possible.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Support</h2>
          <p>
            For order-related queries or support, please email{' '}
            <a href="mailto:support@twineorganicsco.com" className="text-forest hover:underline">
              support@twineorganicsco.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  )
}
