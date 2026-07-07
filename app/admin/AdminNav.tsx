'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/admin/organizers', label: 'Organizers' },
  { href: '/admin/payouts', label: 'Payouts' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-100 bg-white px-4 md:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 py-4">
        <div className="inline-flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href)
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
        <Link href="/dashboard" className="whitespace-nowrap text-sm text-gray-400 hover:text-gray-600">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
