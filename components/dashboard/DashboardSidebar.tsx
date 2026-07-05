'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navItems } from './dashboardNavItems'

type Props = {
  displayName: string
  logoUrl: string | null
  signOutAction: () => Promise<void>
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'T'
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

export default function DashboardSidebar({ displayName, logoUrl, signOutAction }: Props) {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex md:flex-col w-56 shrink-0 border-r border-gray-100 bg-white overflow-y-auto">
      <Link href="/dashboard" className="flex items-center gap-2 px-5 pb-4 pt-6 shrink-0">
        <Image src="/images/logo-create.png" alt="" width={42} height={28} className="h-6 w-auto shrink-0" />
        <Image src="/images/text-logo-create.png" alt="Tikkitte Create" width={160} height={35} className="h-7 w-auto" />
      </Link>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const active = item.match(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#3d3d3d]/10 text-[#3d3d3d]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <item.Icon className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-100 px-4 pb-6 pt-4 shrink-0">
        <div className="mb-3 flex items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#3d3d3d]/10 text-xs font-bold text-[#3d3d3d]">
              {initialsFor(displayName)}
            </div>
          )}
          <span className="truncate text-sm font-medium text-gray-700">{displayName}</span>
        </div>
        <form action={signOutAction}>
          <button type="submit" className="text-xs text-gray-400 transition-colors hover:text-gray-600">
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
