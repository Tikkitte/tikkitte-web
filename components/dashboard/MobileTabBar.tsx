'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from './dashboardNavItems'

export default function MobileTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden flex shrink-0 border-t border-gray-100 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {navItems.map((item) => {
        const active = item.match(pathname)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
              active ? 'text-[#3d3d3d]' : 'text-gray-400'
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
