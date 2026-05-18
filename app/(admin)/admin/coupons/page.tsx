import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { createCoupon } from './actions'
import CouponForm from './_components/CouponForm'
import CouponActions from './_components/CouponActions'

export const metadata: Metadata = { title: 'Coupons' }

function formatExpiry(date: Date | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Coupons</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Create form */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Create Coupon</h2>
            <CouponForm action={createCoupon} />
          </div>
        </div>

        {/* Coupon list */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Code</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Discount</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Uses</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Expires</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      No coupons yet. Create one using the form.
                    </td>
                  </tr>
                ) : coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-mono font-medium text-gray-900">{c.code}</p>
                      {c.description && (
                        <p className="text-xs text-gray-400">{c.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {c.discountType === 'PERCENTAGE'
                        ? `${Number(c.discountValue)}%`
                        : `R${Number(c.discountValue).toFixed(2)}`}
                      {c.minOrderAmount !== null && (
                        <p className="text-xs text-gray-400">
                          Min R{Number(c.minOrderAmount).toFixed(2)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {c.usedCount}
                      {c.maxUses !== null && (
                        <span className="text-gray-400"> / {c.maxUses}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{formatExpiry(c.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <CouponActions id={c.id} isActive={c.isActive} usedCount={c.usedCount} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
