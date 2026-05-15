import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata: Metadata = { title: 'My Orders' }

const statusStyle: Record<string, { pill: string; dot: string }> = {
  PENDING:   { pill: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-400' },
  PAID:      { pill: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-400' },
  SHIPPED:   { pill: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-400' },
  DELIVERED: { pill: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  CANCELLED: { pill: 'bg-gray-50 text-gray-500 border-gray-200',      dot: 'bg-gray-300' },
  FAILED:    { pill: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-400' },
}

export default async function OrdersPage() {
  const session = await auth()
  if (!session) redirect('/account/login')

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <div className="mx-auto max-w-2xl px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/account" className="text-[#9A9A94] hover:text-[#1A3526] transition-colors">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M13 15l-5-5 5-5"/>
            </svg>
          </Link>
          <h1 className="font-serif text-2xl text-[#1A1A18]">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[#E8E3D9] bg-white px-8 py-16 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white border border-[#E8E3D9] mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="#C5C2BB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
            </div>
            <p className="text-[#6B6B65] text-sm mb-5">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#1A3526] hover:bg-[#2D5A3D] px-5 py-2.5 text-sm font-medium text-white transition-colors"
            >
              Start shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const st = statusStyle[order.status] ?? statusStyle.CANCELLED
              return (
                <div key={order.id} className="rounded-2xl border border-[#E8E3D9] bg-white px-6 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="font-mono text-xs font-semibold text-[#1A1A18] tracking-wider">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${st.pill}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                      <p className="text-xs text-[#9A9A94] mb-2">
                        {new Date(order.createdAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <p className="text-sm text-[#6B6B65] truncate">
                        {order.items.map(i => i.product.name).join(' · ')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-[#1A1A18]">R{Number(order.total).toFixed(2)}</p>
                      <p className="text-xs text-[#9A9A94] mt-0.5">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
