import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProfileForm from './ProfileForm'

export const metadata: Metadata = { title: 'Profile' }

export default async function ProfilePage() {
  const session = await auth()
  if (!session) redirect('/account/login')

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
      phone: true,
      addressLine1: true,
      addressLine2: true,
      city: true,
      province: true,
      postalCode: true,
      billingAddressLine1: true,
      billingAddressLine2: true,
      billingCity: true,
      billingProvince: true,
      billingPostalCode: true,
    },
  })

  if (!user) redirect('/account/login')

  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/account" className="text-[#9A9A94] hover:text-[#1A3526] transition-colors">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M13 15l-5-5 5-5"/>
            </svg>
          </Link>
          <h1 className="font-serif text-2xl text-[#1A1A18]">Profile</h1>
        </div>

        <ProfileForm profile={{ ...user, role: user.role as string }} />

        <p className="mt-6 text-xs text-[#9A9A94] text-center">
          Sign in links are sent by email — no password required.
        </p>
      </div>
    </main>
  )
}
