import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/account/login')

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/account" className="text-sm text-gray-500 hover:text-green-700">← Account</Link>
        <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Name</p>
          <p className="mt-1 text-gray-900">{session.user.name}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="mt-1 text-gray-900">{session.user.email}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Role</p>
          <p className="mt-1 text-gray-900 capitalize">{session.user.role.toLowerCase()}</p>
        </div>
      </div>

      <div className="mt-6">
        <Link
          href="/account/reset-password"
          className="text-sm text-green-700 hover:underline"
        >
          Change password →
        </Link>
      </div>
    </main>
  )
}
