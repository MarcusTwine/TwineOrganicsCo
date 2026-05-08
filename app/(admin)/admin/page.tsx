import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="text-gray-500">Welcome to the Twine Organics admin panel.</p>
    </div>
  )
}
