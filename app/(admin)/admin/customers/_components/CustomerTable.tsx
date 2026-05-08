'use client'

import { useTransition, useState } from 'react'
import { setSubscriptionStatus } from '../actions'

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderItem = {
  id: string
  quantity: number
  priceAtPurchase: number
  productName: string
  productImage: string | null
}

type Order = {
  id: string
  status: string
  total: number
  createdAt: string
  items: OrderItem[]
}

type Subscription = {
  id: string
  email: string
  subscribedAt: string
  active: boolean
} | null

type Customer = {
  id: string
  name: string
  email: string
  createdAt: string
  orders: Order[]
  subscription: Subscription
}

type NewsletterOnly = {
  id: string
  email: string
  subscribedAt: string
  active: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusColour: Record<string, string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  PAID:      'bg-blue-100 text-blue-800',
  SHIPPED:   'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-gray-100 text-gray-600',
  FAILED:    'bg-red-100 text-red-800',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColour[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}

// ─── Unsubscribe Button ───────────────────────────────────────────────────────

function SubscriptionToggle({ email, active }: { email: string; active: boolean }) {
  const [pending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      await setSubscriptionStatus(email, !active)
    })
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle() }}
      disabled={pending}
      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        active
          ? 'bg-red-50 text-red-700 hover:bg-red-100'
          : 'bg-green-50 text-green-700 hover:bg-green-100'
      }`}
    >
      {pending ? '…' : active ? 'Unsubscribe' : 'Re-subscribe'}
    </button>
  )
}

// ─── Order Items Row ──────────────────────────────────────────────────────────

function OrderItemsPanel({ items }: { items: OrderItem[] }) {
  return (
    <div className="mx-4 mb-2 rounded border border-gray-100 bg-gray-50">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-3 py-2 text-left font-medium text-gray-500">Product</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Qty</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Unit price</th>
            <th className="px-3 py-2 text-right font-medium text-gray-500">Line total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="px-3 py-2 text-gray-700">{item.productName}</td>
              <td className="px-3 py-2 text-right text-gray-600">{item.quantity}</td>
              <td className="px-3 py-2 text-right text-gray-600">R{item.priceAtPurchase.toFixed(2)}</td>
              <td className="px-3 py-2 text-right font-medium text-gray-900">
                R{(item.quantity * item.priceAtPurchase).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Orders Panel ─────────────────────────────────────────────────────────────

function OrdersPanel({ orders }: { orders: Order[] }) {
  const [openOrders, setOpenOrders] = useState<Set<string>>(new Set())

  function toggleOrder(id: string) {
    setOpenOrders((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (orders.length === 0) {
    return (
      <div className="px-4 py-3 text-sm text-gray-400 italic">No orders yet.</div>
    )
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50/50">
      <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Order History
      </div>
      {orders.map((order) => {
        const isOpen = openOrders.has(order.id)
        return (
          <div key={order.id}>
            <button
              onClick={() => toggleOrder(order.id)}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-100"
            >
              <Chevron open={isOpen} />
              <span className="font-mono text-xs text-gray-500">
                #{order.id.slice(-8).toUpperCase()}
              </span>
              <span className="ml-1 text-gray-600">
                {new Date(order.createdAt).toLocaleDateString('en-ZA')}
              </span>
              <StatusBadge status={order.status} />
              <span className="ml-auto font-semibold text-gray-900">
                R{order.total.toFixed(2)}
              </span>
              <span className="text-xs text-gray-400">
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </span>
            </button>
            {isOpen && <OrderItemsPanel items={order.items} />}
          </div>
        )
      })}
    </div>
  )
}

// ─── Customer Row ─────────────────────────────────────────────────────────────

function CustomerRow({ customer }: { customer: Customer }) {
  const [open, setOpen] = useState(false)
  const totalSpend = customer.orders.reduce((sum, o) => sum + o.total, 0)
  const sub = customer.subscription

  return (
    <>
      <tr
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer hover:bg-gray-50"
      >
        <td className="px-4 py-3">
          <Chevron open={open} />
        </td>
        <td className="px-4 py-3">
          <p className="font-medium text-gray-900">{customer.name}</p>
          <p className="text-xs text-gray-500">{customer.email}</p>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {new Date(customer.createdAt).toLocaleDateString('en-ZA')}
        </td>
        <td className="px-4 py-3 text-right text-sm text-gray-700">
          {customer.orders.length}
        </td>
        <td className="px-4 py-3 text-right font-semibold text-gray-900">
          {totalSpend > 0 ? `R${totalSpend.toFixed(2)}` : '—'}
        </td>
        <td className="px-4 py-3 text-center">
          {sub ? (
            <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${sub.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {sub.active ? 'Active' : 'Unsubscribed'}
            </span>
          ) : (
            <span className="text-gray-300">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-center">
          {sub ? (
            <SubscriptionToggle email={customer.email} active={sub.active} />
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={7} className="p-0">
            <OrdersPanel orders={customer.orders} />
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomerTable({
  customers,
  newsletterOnly,
}: {
  customers: Customer[]
  newsletterOnly: NewsletterOnly[]
}) {
  return (
    <div className="space-y-6">
      {/* Registered customers */}
      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Registered customers ({customers.length})
        </h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 px-4 py-3" />
                <th className="px-4 py-3 text-left font-medium text-gray-500">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Joined</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Orders</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Total spent</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Newsletter</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No customers yet.
                  </td>
                </tr>
              ) : (
                customers.map((c) => <CustomerRow key={c.id} customer={c} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Newsletter-only subscribers */}
      {newsletterOnly.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Newsletter-only subscribers ({newsletterOnly.length})
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Subscribed</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {newsletterOnly.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{sub.email}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(sub.subscribedAt).toLocaleDateString('en-ZA')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${sub.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {sub.active ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <SubscriptionToggle email={sub.email} active={sub.active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
