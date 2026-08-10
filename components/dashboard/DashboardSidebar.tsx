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
    <aside className="hidden md:flex md:w-[232px] md:flex-col md:shrink-0 overflow-y-auto bg-[#191917] text-white">
      <Link href="/dashboard" className="create-focus flex shrink-0 items-center gap-2.5 px-7 pb-9 pt-8" aria-label="Tikkitte Create dashboard">
        <Image src="/images/logo.png" alt="" width={44} height={30} className="h-[27px] w-auto shrink-0" />
        <span className="create-display text-[21px] tracking-[0.02em] text-white">Tikkitte</span>
        <span className="rounded-full bg-[#2e6fe6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">Create</span>
      </Link>

      <nav className="flex-1 space-y-2 px-4" aria-label="Organizer dashboard">
        {navItems.map((item) => {
          const active = item.match(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`create-focus flex min-h-11 items-center gap-3 rounded-full px-4 py-2.5 text-[13.5px] font-medium transition-colors ${
                active
                  ? 'bg-[#2e6fe6] text-white'
                  : 'text-[#a7a59a] hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.Icon className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="shrink-0 px-4 pb-6">
        <div className="border-t border-white/10 pt-4">
        <div className="flex items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="create-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2e6fe6] text-xs text-white">
              {initialsFor(displayName)}
            </div>
          )}
          <div className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-white">{displayName}</span>
            <form action={signOutAction}>
              <button type="submit" className="create-focus text-[11px] text-[#8a887c] transition-colors hover:text-white">
                Sign out
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>
    </aside>
  )
}
