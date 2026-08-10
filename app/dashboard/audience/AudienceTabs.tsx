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
    <nav className="overflow-x-auto" aria-label="Audience sections">
      <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-[var(--tikkitte-cream-border)]">
        {tabs.map((tab) => {
          const active = tab.href === '/dashboard/audience'
            ? pathname === '/dashboard/audience'
            : pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`create-focus min-h-10 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                active ? 'bg-[#191917] text-white' : 'text-[var(--tikkitte-ink-soft)] hover:text-[var(--tikkitte-ink)]'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
