import type { Metadata } from 'next'
import HeroVideo from '@/components/store/HeroVideo'

export const metadata: Metadata = { title: 'Home' }

export default function HomePage() {
  return (
    <main>
      <HeroVideo />
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-green-900">Welcome to Twine Organics</h2>
        <p className="mt-4 text-lg text-gray-600">
          Crafted with care. Grown with purpose. Delivered to you.
        </p>
      </section>
    </main>
  )
}
