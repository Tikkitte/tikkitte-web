'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/admin/organizers', label: 'Organizers' },
  { href: '/admin/payouts', label: 'Payouts' },
  { href: '/admin/refunds', label: 'Refunds' },
  { href: '/admin/comp-tickets', label: 'Comp tickets' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-100 bg-white px-4 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href)
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d3d3d] focus-visible:ring-offset-1 ${
                  active ? 'bg-[#3d3d3d]/10 text-[#3d3d3d]' : 'text-gray-500 hover:bg-white hover:text-gray-700'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center self-start whitespace-nowrap text-sm text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3d3d3d] focus-visible:ring-offset-2 sm:self-auto"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
