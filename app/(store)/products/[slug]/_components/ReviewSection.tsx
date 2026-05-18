import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { submitReview } from '../actions'
import ReviewForm from './ReviewForm'

interface Props {
  productId: string
  slug: string
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'text-2xl' : 'text-base'
  return (
    <span className={cls} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={rating >= s ? 'text-amber-400' : 'text-gray-200'}>★</span>
      ))}
    </span>
  )
}

export default async function ReviewSection({ productId, slug }: Props) {
  const session = await auth()
  const userId = session?.user?.id ?? null

  const [reviews, canReview, hasReviewed] = await Promise.all([
    db.review.findMany({
      where: { productId, isApproved: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    // Can review: logged in, has a qualifying order
    userId
      ? db.orderItem.findFirst({
          where: {
            productId,
            order: { userId, status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] } },
          },
        }).then(Boolean)
      : Promise.resolve(false),
    // Already reviewed
    userId
      ? db.review.findUnique({ where: { productId_userId: { productId, userId } } }).then(Boolean)
      : Promise.resolve(false),
  ])

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : null

  const boundAction = submitReview.bind(null, productId, slug)

  return (
    <section className="mt-16" id="reviews">
      <div className="border-t border-gray-200 pt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer reviews</h2>

        {/* Summary */}
        {avgRating !== null && (
          <div className="flex items-center gap-4 mb-8 p-5 rounded-xl bg-gray-50 border border-gray-100 w-fit">
            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
              <Stars rating={Math.round(avgRating)} size="lg" />
              <p className="text-sm text-gray-500 mt-1">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Write a review */}
        {!session && (
          <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">
            <a href={`/account/login?next=/products/${slug}#reviews`} className="text-forest font-medium hover:underline">
              Sign in
            </a>{' '}
            to leave a review for a product you&apos;ve purchased.
          </div>
        )}

        {session && canReview && !hasReviewed && (
          <div className="mb-10 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Write a review</h3>
            <ReviewForm action={boundAction} />
          </div>
        )}

        {session && hasReviewed && (
          <div className="mb-8 rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 text-sm text-gray-500">
            You&apos;ve already reviewed this product. Thank you!
          </div>
        )}

        {/* Review list */}
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-100 pb-6 last:border-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <Stars rating={r.rating} />
                    {r.title && (
                      <p className="mt-1 font-semibold text-gray-900">{r.title}</p>
                    )}
                  </div>
                  <p className="shrink-0 text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-ZA', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{r.body}</p>
                <p className="mt-2 text-xs text-gray-400">
                  — {r.user.name.split(' ')[0]}{r.user.name.split(' ')[1] ? ' ' + r.user.name.split(' ')[1][0] + '.' : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
