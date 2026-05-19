import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Twine Organics. All rights reserved.
          </p>
          <nav className="flex flex-wrap justify-end gap-x-6 gap-y-2 text-xs text-gray-400">
            <Link href="/policies/refund-policy" className="hover:text-forest">Refund policy</Link>
            <Link href="/policies/privacy-policy" className="hover:text-forest">Privacy policy</Link>
            <Link href="/policies/terms-of-service" className="hover:text-forest">Terms of service</Link>
            <Link href="/policies/shipping-policy" className="hover:text-forest">Shipping policy</Link>
            <Link href="/policies/contact-information" className="hover:text-forest">Contact information</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
