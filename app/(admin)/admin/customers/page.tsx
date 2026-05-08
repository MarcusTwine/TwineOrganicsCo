import type { Metadata } from 'next'
import { db } from '@/lib/db'
import CustomerTable from './_components/CustomerTable'

export const metadata: Metadata = { title: 'Customers' }

export default async function AdminCustomersPage() {
  const [customers, subscriptions] = await Promise.all([
    db.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: { select: { name: true, images: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.newsletterSubscription.findMany({ orderBy: { subscribedAt: 'desc' } }),
  ])

  const subMap = new Map(subscriptions.map((s) => [s.email, s]))

  const customerRows = customers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt.toISOString(),
    orders: u.orders.map((o) => ({
      id: o.id,
      status: o.status as string,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        priceAtPurchase: Number(i.priceAtPurchase),
        productName: i.product.name,
        productImage: i.product.images[0] ?? null,
      })),
    })),
    subscription: (() => {
      const s = subMap.get(u.email)
      if (!s) return null
      return { id: s.id, email: s.email, subscribedAt: s.subscribedAt.toISOString(), active: s.active }
    })(),
  }))

  // Newsletter-only: subscribers with no registered account
  const customerEmails = new Set(customers.map((u) => u.email))
  const newsletterOnly = subscriptions
    .filter((s) => !customerEmails.has(s.email))
    .map((s) => ({
      id: s.id,
      email: s.email,
      subscribedAt: s.subscribedAt.toISOString(),
      active: s.active,
    }))

  const totalSpend = customerRows.reduce(
    (sum, c) => sum + c.orders.reduce((s, o) => s + o.total, 0),
    0,
  )

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Customers</h1>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: 'Total customers', value: customers.length },
          { label: 'With orders', value: customerRows.filter((c) => c.orders.length > 0).length },
          { label: 'Newsletter only', value: newsletterOnly.length },
          { label: 'Total revenue', value: `R${totalSpend.toFixed(2)}` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <CustomerTable customers={customerRows} newsletterOnly={newsletterOnly} />
    </div>
  )
}
