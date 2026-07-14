'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

type Props = {
  listEventHref?: string
}

const links = [
  { label: 'Home', href: '/' },
  { label: 'Browse events', href: '/events' },
  { label: 'Organizers', href: '/organizers' },
]

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 9.8V20h13V9.8" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1.5a2.5 2.5 0 0 0 0 5V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5a2.5 2.5 0 0 0 0-5Z" />
      <line x1="15" y1="6.5" x2="15" y2="17.5" strokeDasharray="2 3" />
    </svg>
  )
}

function CalendarPlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M8 4v3" />
      <path d="M16 4v3" />
      <path d="M4 11h16" />
      <path d="M12 13.5v4" />
      <path d="M10 15.5h4" />
    </svg>
  )
}

const mobileLinks = [
  { href: '/', label: 'Home', Icon: HomeIcon },
  { href: '/events', label: 'Browse events', Icon: TicketIcon },
  { href: '/organizers', label: 'Organizers', Icon: CalendarPlusIcon },
]

export default function Nav({ listEventHref = '/organizers' }: Props) {
  const pathname = usePathname()

  return (
    <header className="bg-[#F4F2EC]">
      <nav className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-[clamp(20px,4vw,56px)] py-5 font-grotesk">
        <Link href="/" className="flex flex-shrink-0 select-none items-center gap-2.5">
          <Image src="/images/logo.png" alt="" width={42} height={28} priority unoptimized style={{ width: 'auto', height: '34px' }} />
          <Image src="/images/text-logo-web.png" alt="Tikkitte" width={120} height={20} priority unoptimized style={{ height: '22px', width: 'auto' }} />
        </Link>

        <div className="hidden flex-wrap items-center gap-[clamp(14px,2.5vw,32px)] min-[760px]:flex">
          {links.map(({ label, href }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`text-[15px] font-medium transition-colors ${active ? 'text-[#191917]' : 'text-[#5F5D54] hover:text-[#191917]'}`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <Link
          href={listEventHref}
          className="hidden rounded-full bg-[#2565D0] px-[22px] py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#1E56B5] min-[760px]:inline-block"
        >
          List your event
        </Link>

        <div className="flex items-center gap-[10px] min-[760px]:hidden">
          {mobileLinks.map(({ href, label, Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-label={label}
                className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                  active
                    ? 'border-[#2565D0] bg-[#2565D0] text-white'
                    : 'border-[#C8C3B2] bg-transparent text-[#5F5D54] hover:border-[#2565D0] hover:text-[#2565D0]'
                }`}
              >
                <Icon />
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
