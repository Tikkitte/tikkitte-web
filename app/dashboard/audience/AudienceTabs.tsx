'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/dashboard/audience', label: 'Fans' },
  { href: '/dashboard/audience/marketing', label: 'Marketing' },
]

export default function AudienceTabs() {
  const pathname = usePathname()

  return (
    <div className="mb-6 overflow-x-auto">
      <div className="inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((tab) => {
          const active = tab.href === '/dashboard/audience'
            ? pathname === '/dashboard/audience'
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                active ? 'bg-[#3d3d3d]/10 text-[#3d3d3d]' : 'text-gray-500 hover:bg-white'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
