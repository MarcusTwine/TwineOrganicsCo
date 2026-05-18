import type { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import ReviewModerationActions from './_components/ReviewModerationActions'

export const metadata: Metadata = { title: 'Reviews' }

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={rating >= s ? 'text-amber-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter = 'pending' } = await searchParams
  const isPending = filter !== 'approved'

  const reviews = await db.review.findMany({
    where: { isApproved: !isPending },
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const [pendingCount, approvedCount] = await Promise.all([
    db.review.count({ where: { isApproved: false } }),
    db.review.count({ where: { isApproved: true } }),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reviews</h1>
        <a
          href="/api/reviews/feed.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline border border-blue-200 rounded px-3 py-1.5"
        >
          Google Review Feed ↗
        </a>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        {[
          { label: `Pending (${pendingCount})`, value: 'pending' },
          { label: `Approved (${approvedCount})`, value: 'approved' },
        ].map(({ label, value }) => (
          <Link
            key={value}
            href={`/admin/reviews?filter=${value}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              filter === value
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Review</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Product</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 text-right font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No {isPending ? 'pending' : 'approved'} reviews.
                </td>
              </tr>
            ) : reviews.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 align-top">
                <td className="px-4 py-4 max-w-xs">
                  <Stars rating={r.rating} />
                  {r.title && <p className="font-medium text-gray-900 mt-1">{r.title}</p>}
                  <p className="text-gray-600 mt-1 text-xs leading-relaxed line-clamp-3">{r.body}</p>
                </td>
                <td className="px-4 py-4">
                  <Link href={`/products/${r.product.slug}`} className="text-forest hover:underline font-medium" target="_blank">
                    {r.product.name}
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-gray-900">{r.user.name}</p>
                  <p className="text-gray-400 text-xs">{r.user.email}</p>
                </td>
                <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(r.createdAt).toLocaleDateString('en-ZA', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </td>
                <td className="px-4 py-4">
                  <ReviewModerationActions id={r.id} isApproved={r.isApproved} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
