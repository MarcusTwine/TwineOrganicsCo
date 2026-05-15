import type { Metadata } from 'next'
import Link from 'next/link'
import HeroVideo from '@/components/store/HeroVideo'
import NewsletterForm from '@/components/store/NewsletterForm'
import { getFeaturedProducts, getProducts } from '@/lib/products'
import { db } from '@/lib/db'

export const metadata: Metadata = { title: 'Home' }

const GOLD = '#a07840'
const CREAM = '#f5ede0'
const BARK = '#1c1409'
const GOLD_LIGHT = '#d4b896'

export default async function HomePage() {
  const [featured, recentPosts] = await Promise.all([
    getFeaturedProducts(),
    db.post.findMany({
      where: { status: 'PUBLISHED' },
      include: { author: { select: { name: true } } },
      orderBy: { publishedAt: 'desc' },
      take: 2,
    }),
  ])

  const allProducts = featured.length > 0 ? featured : await getProducts({})
  const displayProducts = allProducts.slice(0, 3)

  return (
    <main>
      <HeroVideo />

      {/* ── Manifesto ── */}
      <section style={{ backgroundColor: CREAM }} className="px-4 py-28 text-center">
        <p
          className="mb-6 text-xs font-semibold uppercase tracking-[0.3em]"
          style={{ color: GOLD }}
        >
          Twine Organics
        </p>
        <h2 className="mx-auto max-w-3xl font-serif text-5xl italic leading-tight text-stone-900 md:text-6xl lg:text-7xl">
          Skin food the way<br />nature intended.
        </h2>
        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-stone-600">
          Pure tallow balms, lip care, and deodorant — crafted from grass-fed heritage,
          free from synthetic chemistry.
        </p>
        <Link
          href="/products"
          className="mt-10 inline-block border border-stone-900 px-10 py-3.5 text-sm font-semibold uppercase tracking-widest text-stone-900 transition-colors hover:bg-stone-900 hover:text-white"
        >
          Shop the Collection
        </Link>
      </section>

      {/* ── Featured Products ── */}
      <section className="bg-white px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 flex items-end justify-between">
            <div>
              <p
                className="mb-2 text-xs font-semibold uppercase tracking-[0.25em]"
                style={{ color: GOLD }}
              >
                Our Formulations
              </p>
              <h2 className="font-serif text-4xl text-stone-900 md:text-5xl">The Collection</h2>
            </div>
            <Link
              href="/products"
              className="hidden text-sm font-medium text-stone-500 underline underline-offset-4 hover:text-stone-900 sm:block"
            >
              View all →
            </Link>
          </div>

          {displayProducts.length === 0 ? (
            <p className="text-stone-400">Products coming soon.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {displayProducts.map((product) => (
                <Link key={product.id} href={`/products/${product.slug}`} className="group">
                  <div
                    className="overflow-hidden"
                    style={{ aspectRatio: '4/5', backgroundColor: '#f9f5ef' }}
                  >
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-serif text-6xl" style={{ color: GOLD_LIGHT }}>✦</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    {product.category && (
                      <p
                        className="mb-1 text-xs font-semibold uppercase tracking-widest"
                        style={{ color: GOLD }}
                      >
                        {product.category.name}
                      </p>
                    )}
                    <h3 className="font-serif text-xl text-stone-900 transition-colors group-hover:text-[#a07840]">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">
                      R{Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 sm:hidden">
            <Link
              href="/products"
              className="text-sm font-medium underline underline-offset-4 text-stone-600 hover:text-stone-900"
            >
              View all products →
            </Link>
          </div>
        </div>
      </section>

      {/* ── The Story — dark split ── */}
      <section style={{ backgroundColor: BARK }} className="overflow-hidden">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2">
            <div className="flex flex-col justify-center px-8 py-24 md:px-16">
              <p
                className="mb-6 text-xs font-semibold uppercase tracking-[0.3em]"
                style={{ color: GOLD }}
              >
                The Twine Story
              </p>
              <h2 className="mb-8 font-serif text-4xl italic leading-snug text-white md:text-5xl">
                Before chemistry,<br />there was tallow.
              </h2>
              <p className="mb-5 leading-relaxed text-stone-300">
                For centuries, grass-fed tallow was humanity's finest skincare. Its lipid profile
                mirrors that of human skin — making it uniquely absorbable in ways no synthetic
                cream can replicate.
              </p>
              <p className="mb-10 leading-relaxed text-stone-300">
                We source only from ethically raised, grass-fed cattle and combine it with
                organic botanicals — nothing more, nothing less.
              </p>
              <Link
                href="/blog"
                className="self-start border border-white px-8 py-3 text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-[#1c1409]"
              >
                Read Our Story
              </Link>
            </div>

            <div className="relative" style={{ minHeight: '480px' }}>
              <img
                src="/uploads/products/1778247598888-bsavmxbr5sl.jpg"
                alt="Twine Organics tallow balm"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: `linear-gradient(to right, ${BARK} 0%, transparent 35%)` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Why It Works — ingredient pillars ── */}
      <section style={{ backgroundColor: CREAM }} className="px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <p
              className="mb-3 text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: GOLD }}
            >
              The Science of Simple
            </p>
            <h2 className="font-serif text-4xl text-stone-900 md:text-5xl">
              Nature's formula
            </h2>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: 'Vitamin A',
                label: 'A',
                subtitle: 'Renews & Brightens',
                desc: 'Accelerates skin cell renewal, reducing fine lines and uneven tone.',
              },
              {
                name: 'Vitamin D',
                label: 'D',
                subtitle: 'Nourishes & Protects',
                desc: 'Supports the skin barrier, promoting resilience against environmental stress.',
              },
              {
                name: 'Vitamin E',
                label: 'E',
                subtitle: 'Antioxidant Shield',
                desc: 'Neutralises free radicals and locks in moisture for lasting hydration.',
              },
              {
                name: 'Vitamin K₂',
                label: 'K₂',
                subtitle: 'Heals & Revitalises',
                desc: 'Reduces redness and supports the repair of damaged, sensitive skin.',
              },
            ].map((v) => (
              <div key={v.name} className="text-center">
                <div
                  className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border"
                  style={{ borderColor: GOLD }}
                >
                  <span className="font-serif text-lg" style={{ color: GOLD }}>{v.label}</span>
                </div>
                <h3 className="mb-1 font-serif text-xl text-stone-900">{v.name}</h3>
                <p
                  className="mb-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: GOLD }}
                >
                  {v.subtitle}
                </p>
                <p className="text-sm leading-relaxed text-stone-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-white px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <p
            className="mb-14 text-center text-xs font-semibold uppercase tracking-[0.3em]"
            style={{ color: GOLD }}
          >
            What Our Community Says
          </p>
          <div className="grid gap-12 sm:grid-cols-3">
            {[
              {
                quote: "The baby bum balm cleared my son's rash in two days. I won't use anything else.",
                author: 'Sarah M., Cape Town',
              },
              {
                quote: "I've tried every natural moisturiser out there. Nothing comes close to this tallow face balm.",
                author: 'Ané K., Johannesburg',
              },
              {
                quote: "Finally a deodorant that actually works — without the chemicals or the sensitivity.",
                author: 'James R., Durban',
              },
            ].map((t) => (
              <div key={t.author} className="flex flex-col">
                <span
                  className="mb-2 font-serif text-6xl leading-none"
                  style={{ color: GOLD_LIGHT }}
                >
                  &ldquo;
                </span>
                <p className="flex-1 font-serif text-xl italic leading-relaxed text-stone-700">
                  {t.quote}
                </p>
                <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-stone-400">
                  — {t.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── From the Journal ── */}
      {recentPosts.length > 0 && (
        <section style={{ backgroundColor: CREAM }} className="px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-14 flex items-end justify-between">
              <div>
                <p
                  className="mb-2 text-xs font-semibold uppercase tracking-[0.25em]"
                  style={{ color: GOLD }}
                >
                  Stories & Rituals
                </p>
                <h2 className="font-serif text-4xl text-stone-900 md:text-5xl">
                  From the Journal
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden text-sm font-medium text-stone-500 underline underline-offset-4 hover:text-stone-900 sm:block"
              >
                All posts →
              </Link>
            </div>

            <div className="grid gap-12 sm:grid-cols-2">
              {recentPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  {post.coverImage && (
                    <div className="mb-5 overflow-hidden" style={{ aspectRatio: '16/9' }}>
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <p className="mb-2 text-xs text-stone-400">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-ZA', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : ''}
                  </p>
                  <h3 className="mb-3 font-serif text-2xl text-stone-900 transition-colors group-hover:text-[#a07840]">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm leading-relaxed text-stone-500 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-stone-700 transition-colors group-hover:text-[#a07840]">
                    Read →
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ── */}
      <section className="bg-forest px-4 py-24 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-green-300">
          Join the Community
        </p>
        <h2 className="mb-4 font-serif text-4xl italic text-white md:text-5xl">
          Good things, growing.
        </h2>
        <p className="mx-auto mb-10 max-w-md text-green-200">
          Seasonal rituals, ingredient stories, and early access to new formulations —
          delivered to your inbox.
        </p>
        <NewsletterForm />
      </section>
    </main>
  )
}
