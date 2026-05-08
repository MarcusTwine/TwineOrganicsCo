import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'My Account' }

export default async function AccountPage() {
  const session = await auth()
  if (!session) redirect('/account/login')

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-8 text-2xl font-semibold text-gray-900">My Account</h1>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Signed in as</p>
        <p className="mt-1 font-medium text-gray-900">{session.user.name}</p>
        <p className="text-sm text-gray-600">{session.user.email}</p>
      </div>

      <nav className="space-y-3">
        <Link
          href="/account/orders"
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-4 hover:border-green-300 hover:bg-green-50 transition-colors"
        >
          <span className="font-medium text-gray-900">My Orders</span>
          <span className="text-gray-400">→</span>
        </Link>
        <Link
          href="/account/profile"
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-6 py-4 hover:border-green-300 hover:bg-green-50 transition-colors"
        >
          <span className="font-medium text-gray-900">Profile Settings</span>
          <span className="text-gray-400">→</span>
        </Link>
        {session.user.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-6 py-4 hover:border-green-400 hover:bg-green-100 transition-colors"
          >
            <span className="font-medium text-green-800">Admin Dashboard</span>
            <span className="text-green-600">→</span>
          </Link>
        )}
      </nav>

      <form action="/api/auth/signout" method="POST" className="mt-8">
        <button
          type="submit"
          className="text-sm text-gray-500 hover:text-red-600 hover:underline"
        >
          Sign out
        </button>
      </form>
    </main>
  )
}
