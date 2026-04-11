'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Events', match: (p: string) => p === '/dashboard' || p.startsWith('/dashboard/events') },
  { href: '/dashboard/transactions', label: 'Transactions', match: (p: string) => p.startsWith('/dashboard/transactions') },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <nav className="flex gap-1">
      {navItems.map((item) => {
        const active = mounted && item.match(pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors ${
              active
                ? 'bg-[#1d67ba]/10 text-[#1d67ba]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
