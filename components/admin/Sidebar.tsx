'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/stock', label: 'Stock' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/blog', label: 'Blog' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 shrink-0 border-r border-gray-200 bg-white">
      <nav className="flex flex-col gap-1 p-4">
        {links.map(({ href, label, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-green-50 text-green-800'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
