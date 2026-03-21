'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Events', match: (p: string) => p === '/dashboard' || p.startsWith('/dashboard/events') },
  { href: '/dashboard/transactions', label: 'Transactions', match: (p: string) => p.startsWith('/dashboard/transactions') },
]

export default function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1">
      {navItems.map((item) => {
        const active = item.match(pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors ${
              active
                ? 'bg-[#1d67ba]/10 text-[#1d67ba] dark:bg-[#1d67ba]/20'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
