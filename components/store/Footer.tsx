import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Twine Organics. All rights reserved.
          </p>
          <nav className="flex gap-6 text-sm text-gray-500">
            <Link href="/products" className="hover:text-forest">Shop</Link>
            <Link href="/blog" className="hover:text-forest">Blog</Link>
            <Link href="/account" className="hover:text-forest">Account</Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
