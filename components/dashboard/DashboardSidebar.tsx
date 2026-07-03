'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type IconProps = {
  className?: string
}

type NavItem = {
  href: string
  label: string
  match: (pathname: string) => boolean
  Icon: (props: IconProps) => React.ReactNode
}

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

function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 10.5 9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M8 2.5v4M16 2.5v4M3 9h18" />
    </svg>
  )
}

function UsersIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
      <circle cx="9.5" cy="7.5" r="3.5" />
      <path d="M21 20v-1.5a4 4 0 0 0-3-3.9" />
      <path d="M16 4.1a3.5 3.5 0 0 1 0 6.8" />
    </svg>
  )
}

function MegaphoneIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 13h3l9 4V7l-9 4H4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2Z" />
      <path d="m7 13 1.5 6H11" />
      <path d="M19 9.5a4 4 0 0 1 0 5" />
    </svg>
  )
}

function GearIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6V20a2 2 0 1 1-4 0v-.08a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1H4a2 2 0 1 1 0-4h.08a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6V4a2 2 0 1 1 4 0v.08a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.4 9c.22.36.43.7.6 1H20a2 2 0 1 1 0 4h-.08a1.7 1.7 0 0 0-.52 1Z" />
    </svg>
  )
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', match: (pathname) => pathname === '/dashboard', Icon: HomeIcon },
  { href: '/dashboard/events', label: 'Events', match: (pathname) => pathname.startsWith('/dashboard/events'), Icon: CalendarIcon },
  { href: '/dashboard/fans', label: 'Fans', match: (pathname) => pathname.startsWith('/dashboard/fans'), Icon: UsersIcon },
  { href: '/dashboard/marketing', label: 'Marketing', match: (pathname) => pathname.startsWith('/dashboard/marketing'), Icon: MegaphoneIcon },
  { href: '/dashboard/settings', label: 'Settings', match: (pathname) => pathname.startsWith('/dashboard/settings'), Icon: GearIcon },
]

export default function DashboardSidebar({ displayName, logoUrl, signOutAction }: Props) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-56 flex-col border-r border-gray-100 bg-white">
      <Link href="/dashboard" className="flex items-center gap-2 px-5 pb-4 pt-6">
        <Image src="/images/logo.png" alt="" width={42} height={28} unoptimized className="h-6 w-auto shrink-0" />
        <Image src="/images/text-logo-web.png" alt="Tikkitte" width={120} height={20} unoptimized className="h-[18px] w-auto" />
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
                  ? 'bg-[#1d67ba]/10 text-[#1d67ba]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <item.Icon className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-gray-100 px-4 pb-6 pt-4">
        <div className="mb-3 flex items-center gap-2.5">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1d67ba]/10 text-xs font-bold text-[#1d67ba]">
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
