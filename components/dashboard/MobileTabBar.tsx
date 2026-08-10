'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from './dashboardNavItems'

export default function MobileTabBar() {
  const pathname = usePathname()

  if (pathname === '/dashboard/events/new') return null

  return (
    <nav
      className="md:hidden flex shrink-0 border-t border-[#e7e2d4] bg-white px-2"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Organizer dashboard"
    >
      {navItems.map((item) => {
        const active = item.match(pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`create-focus my-1 flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-full py-2 text-[10px] font-semibold transition-colors ${
              active ? 'bg-[#d9e4fa] text-[#2565d0]' : 'text-[#8a887c]'
            }`}
          >
            <item.Icon className="shrink-0" />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
