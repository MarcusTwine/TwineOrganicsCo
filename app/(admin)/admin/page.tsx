import type { Metadata } from 'next'
import { db } from '@/lib/db'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard' }

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const [productCount, orderCount, customerCount, revenueResult, recentOrders] = await Promise.all([
    db.product.count({ where: { isActive: true } }),
    db.order.count(),
    db.user.count({ where: { role: 'CUSTOMER' } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
  ])

  const revenue = Number(revenueResult._sum.total ?? 0)

  const stats = [
    {
      label: 'Active products',
      value: productCount.toString(),
      href: '/admin/products',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      color: 'text-[#1A3526] bg-[#1A3526]/8',
    },
    {
      label: 'Total orders',
      value: orderCount.toString(),
      href: '/admin/orders',
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      color: 'text-blue-700 bg-blue-50',
    },
    {
      label: 'Customers',
      value: customerCount.toString(),
      href: '/admin/customers',
      icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z',
      color: 'text-violet-700 bg-violet-50',
    },
    {
      label: 'Revenue (paid)',
      value: `R${revenue.toFixed(0)}`,
      href: '/admin/orders',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-[#C8994A] bg-[#C8994A]/10',
    },
  ]

  const statusStyle: Record<string, string> = {
    PENDING:   'bg-amber-50 text-amber-700 border-amber-200',
    PAID:      'bg-blue-50 text-blue-700 border-blue-200',
    SHIPPED:   'bg-violet-50 text-violet-700 border-violet-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-gray-50 text-gray-500 border-gray-200',
    FAILED:    'bg-red-50 text-red-600 border-red-200',
  }

  return (
    <div className="max-w-5xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#1A1A18]">Dashboard</h1>
        <p className="text-sm text-[#9A9A94] mt-1">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, href, icon, color }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-2xl border border-[#E8E3D9] bg-white px-5 py-5 hover:border-[#2D5A3D]/30 hover:shadow-sm transition-all"
          >
            <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl mb-4 ${color}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5 w-[18px] h-[18px]">
                <path d={icon}/>
              </svg>
            </div>
            <p className="text-2xl font-semibold text-[#1A1A18] tabular-nums">{value}</p>
            <p className="text-xs text-[#9A9A94] mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#1A1A18]">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs text-[#2D5A3D] hover:text-[#1A3526] transition-colors">
            View all →
          </Link>
        </div>

        <div className="rounded-2xl border border-[#E8E3D9] bg-white overflow-hidden">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-[#9A9A94]">No orders yet.</div>
          ) : (
            <div className="divide-y divide-[#F0EDE8]">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#FAF8F3] transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#1A3526]/8 flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-bold text-[#1A3526] font-mono">{o.id.slice(-2).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#1A1A18] truncate">{o.user.name}</p>
                      <p className="text-xs text-[#9A9A94]">{new Date(o.createdAt).toLocaleDateString('en-ZA')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`hidden sm:inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusStyle[o.status] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                    </span>
                    <span className="text-sm font-semibold text-[#1A1A18] tabular-nums">R{Number(o.total).toFixed(2)}</span>
                    <Link href={`/admin/orders/${o.id}`} className="text-xs text-[#2D5A3D] hover:text-[#1A3526] transition-colors">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/admin/products/new', label: 'Add product' },
          { href: '/admin/blog/new',     label: 'New post' },
          { href: '/admin/stock',        label: 'Check stock' },
          { href: '/admin/settings',     label: 'Settings' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl border border-[#E8E3D9] bg-white px-4 py-3 text-center text-sm font-medium text-[#555550] hover:border-[#2D5A3D]/40 hover:text-[#1A3526] hover:bg-[#1A3526]/3 transition-all"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
