import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Twine Organics collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-forest">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">Privacy Policy</span>
      </nav>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">Privacy Policy</h1>

      <div className="space-y-6 text-gray-700">
        <p>
          This Privacy Policy describes how Twine Organics Company collects, uses, and shares your personal information when you visit or make a purchase from twineorganicsco.com.
        </p>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Personal Information We Collect</h2>
          <p className="mb-3">
            When you visit the site, we automatically collect certain information about your device, including your web browser, IP address, time zone, and some of the cookies that are installed on your device. We refer to this as "Device Information."
          </p>
          <p className="mb-3">We collect Device Information using the following technologies:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li><strong>Cookies</strong> — data files placed on your device or computer.</li>
            <li><strong>Log files</strong> — track actions on the site and collect IP addresses, browser type, and timestamps.</li>
            <li><strong>Web beacons, tags, and pixels</strong> — electronic files that record browsing information.</li>
          </ul>
          <p className="mt-3">
            When you make or attempt a purchase, we collect your name, billing address, shipping address, payment information (including credit card numbers), email address, and phone number.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">How We Use Your Information</h2>
          <p className="mb-3">
            We use order information to fulfil orders, process payments, arrange shipping, and generate invoices. We also use it to communicate with you, screen for fraud, and provide targeted marketing where aligned with your preferences.
          </p>
          <p>
            Device information helps us identify potential fraud risks and improve our site performance through analytics and campaign assessment.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Sharing Your Information</h2>
          <p>
            We share your information with third-party service providers who assist with our operations, including Google Analytics for customer behaviour insights. Information may also be shared to comply with applicable laws and regulations, or to protect our rights.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Behavioural Advertising</h2>
          <p>
            You can opt out of targeted advertising through your Facebook, Google, and Bing settings, or via the{' '}
            <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-forest hover:underline">
              Digital Advertising Alliance
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Your Rights</h2>
          <p>
            If you are a European resident, you have the right to access, correct, or request deletion of your personal information. To exercise these rights, please contact us at{' '}
            <a href="mailto:support@twineorganicsco.com" className="text-forest hover:underline">
              support@twineorganicsco.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Data Retention</h2>
          <p>
            Order information remains on file unless you request deletion.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Minors</h2>
          <p>
            This site is not intended for individuals under the age of 13.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Contact Us</h2>
          <p>
            For questions or concerns about our privacy practices, please contact us at{' '}
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
