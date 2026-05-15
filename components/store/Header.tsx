import Link from 'next/link'
import Image from 'next/image'
import { auth, signOut } from '@/lib/auth'

export default async function Header() {
  const session = await auth()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center">
          <Image
            src="/toc_logo.png"
            alt="Twine Organics"
            width={210}
            height={48}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/products" className="text-gray-600 hover:text-forest">
            Shop
          </Link>
          <Link href="/blog" className="text-gray-600 hover:text-forest">
            Blog
          </Link>
          <Link href="/cart" className="text-gray-600 hover:text-forest">
            Cart
          </Link>
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/account" className="text-gray-600 hover:text-forest">
                Account
              </Link>
              {session.user.role === 'ADMIN' && (
                <Link href="/admin" className="text-gray-600 hover:text-forest">
                  Admin
                </Link>
              )}
              <form
                action={async () => {
                  'use server'
                  await signOut({ redirectTo: '/' })
                }}
              >
                <button type="submit" className="text-gray-600 hover:text-forest">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/account/login"
              className="rounded-md bg-forest px-4 py-1.5 text-white hover:bg-forest"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
