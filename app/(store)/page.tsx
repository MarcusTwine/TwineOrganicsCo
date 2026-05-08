import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Home' }

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-green-900">Welcome to Twine Organics</h1>
      <p className="mt-4 text-lg text-gray-600">
        Premium organic products, delivered to your door.
      </p>
    </main>
  )
}
