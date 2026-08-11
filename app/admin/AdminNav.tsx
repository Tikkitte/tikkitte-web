'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type IconProps = { className?: string }

function PeopleIcon({ className }: IconProps) {
  return <svg className={className} width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}

function PayoutIcon({ className }: IconProps) {
  return <svg className={className} width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20M17 15h.01"/></svg>
}

function CalendarIcon({ className }: IconProps) {
  return <svg className={className} width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
}

function RefundIcon({ className }: IconProps) {
  return <svg className={className} width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v10M15 9.5c-.5-1-1.5-1.5-3-1.5-1.7 0-3 1-3 2.3 0 3.7 6 1.3 6 5 0 1.4-1.3 2.7-3 2.7-1.5 0-2.7-.6-3.3-1.7"/></svg>
}

function TicketIcon({ className }: IconProps) {
  return <svg className={className} width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M2 9a3 3 0 0 0 0 6v3h20v-3a3 3 0 0 0 0-6V6H2v3Z"/><path d="M13 6v2M13 11v2M13 16v2"/></svg>
}

const tabs = [
  { href: '/admin/organizers', label: 'Organizers', Icon: PeopleIcon },
  { href: '/admin/events', label: 'Events', Icon: CalendarIcon },
  { href: '/admin/payouts', label: 'Payouts', Icon: PayoutIcon },
  { href: '/admin/refunds', label: 'Refunds', Icon: RefundIcon },
  { href: '/admin/comp-tickets', label: 'Comp tickets', Icon: TicketIcon },
]

export default function AdminNav({ displayName }: { displayName: string }) {
  const pathname = usePathname()

  const navigation = tabs.map((tab) => {
    const active = pathname.startsWith(tab.href)
    return (
      <Link
        key={tab.href}
        href={tab.href}
        className={`create-focus flex min-h-11 items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-[13.5px] font-medium transition-colors ${
          active ? 'bg-[#2e6fe6] text-white' : 'text-[#a7a59a] hover:bg-white/5 hover:text-white'
        }`}
      >
        <tab.Icon className="shrink-0" />
        <span>{tab.label}</span>
      </Link>
    )
  })

  return (
    <>
      <aside className="hidden w-[232px] shrink-0 flex-col overflow-y-auto bg-[#191917] text-white md:flex">
        <Link href="/admin/organizers" className="create-focus flex items-center gap-2.5 px-7 pb-9 pt-8" aria-label="Tikkitte admin home">
          <Image src="/images/logo.png" alt="" width={44} height={30} className="h-[27px] w-auto shrink-0" />
          <span className="create-display text-[21px] tracking-[0.02em] text-white">Tikkitte</span>
          <span className="rounded-full bg-[#2e6fe6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white">Admin</span>
        </Link>

        <nav className="flex-1 space-y-2 px-4" aria-label="Admin navigation">{navigation}</nav>

        <div className="shrink-0 px-4 pb-6">
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center gap-2.5 px-2">
              <div className="create-display flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2e6fe6] text-xs text-white">AD</div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-white">{displayName}</p>
                <Link href="/dashboard" className="create-focus text-[11px] text-[#8a887c] transition-colors hover:text-white">Back to dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="bg-[#191917] px-4 pb-3 pt-[max(18px,env(safe-area-inset-top))] text-white md:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <Link href="/admin/organizers" className="create-focus flex items-center gap-2" aria-label="Tikkitte admin home">
            <Image src="/images/logo.png" alt="" width={44} height={30} className="h-7 w-auto" />
            <span className="rounded-full bg-[#2e6fe6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em]">Admin</span>
          </Link>
          <Link href="/dashboard" className="create-focus min-h-11 content-center text-xs text-[#a7a59a]">Dashboard →</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto pb-1" aria-label="Admin navigation">{navigation}</nav>
      </div>
    </>
  )
}
