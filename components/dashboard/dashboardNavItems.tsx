export type IconProps = { className?: string }

export function HomeIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 10.5 9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M8 2.5v4M16 2.5v4M3 9h18" />
    </svg>
  )
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
      <circle cx="9.5" cy="7.5" r="3.5" />
      <path d="M21 20v-1.5a4 4 0 0 0-3-3.9" />
      <path d="M16 4.1a3.5 3.5 0 0 1 0 6.8" />
    </svg>
  )
}

export function MegaphoneIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 13h3l9 4V7l-9 4H4a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2Z" />
      <path d="m7 13 1.5 6H11" />
      <path d="M19 9.5a4 4 0 0 1 0 5" />
    </svg>
  )
}

export function GearIcon({ className }: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6V20a2 2 0 1 1-4 0v-.08a1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.88.34l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1H4a2 2 0 1 1 0-4h.08a1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.88l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6V4a2 2 0 1 1 4 0v.08a1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.88-.34l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.7 1.7 0 0 0 19.4 9c.22.36.43.7.6 1H20a2 2 0 1 1 0 4h-.08a1.7 1.7 0 0 0-.52 1Z" />
    </svg>
  )
}

export type NavItem = {
  href: string
  label: string
  match: (pathname: string) => boolean
  Icon: (props: IconProps) => React.ReactNode
}

export const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', match: (p) => p === '/dashboard', Icon: HomeIcon },
  { href: '/dashboard/events', label: 'Events', match: (p) => p.startsWith('/dashboard/events'), Icon: CalendarIcon },
  { href: '/dashboard/audience', label: 'Audience', match: (p) => p.startsWith('/dashboard/audience'), Icon: UsersIcon },
  { href: '/dashboard/settings', label: 'Settings', match: (p) => p.startsWith('/dashboard/settings'), Icon: GearIcon },
]
