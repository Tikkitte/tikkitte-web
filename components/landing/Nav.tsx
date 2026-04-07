'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type Props = {
  showOrganizerCta?: boolean
}

const links = [
  { label: 'Home', href: '/' },
  { label: 'Browse Events', href: '/events' },
  { label: 'Organizers', href: '/organizers' },
  { label: 'About', href: '/about' },
]

export default function Nav({ showOrganizerCta = false }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 bg-white border-b transition-all duration-300 ${
        scrolled
          ? 'border-gray-200 shadow-[0_1px_12px_rgba(0,0,0,0.06)]'
          : 'border-gray-100 shadow-none'
      }`}
    >
      <nav className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">

        {/* Logo — brand mark only, not a link */}
        <div className="flex-shrink-0 select-none">
          <Image
            src="/images/text-logo-web.png"
            alt="Tikkitte"
            width={192}
            height={32}
            priority
            unoptimized
            style={{ height: '32px', width: 'auto', display: 'block' }}
          />
        </div>

        {/* Centre links */}
        <div className="hidden sm:flex items-center gap-8">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`
                relative text-sm font-medium text-gray-500 hover:text-gray-900
                transition-colors duration-150
                after:absolute after:bottom-[-2px] after:left-0
                after:h-[2px] after:w-0 after:rounded-full after:bg-gray-900
                after:transition-[width] after:duration-200
                hover:after:w-full
              `}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`
              relative text-sm font-medium text-gray-500 hover:text-gray-900
              transition-colors duration-150
              after:absolute after:bottom-[-2px] after:left-0
              after:h-[2px] after:w-0 after:rounded-full after:bg-gray-900
              after:transition-[width] after:duration-200
              hover:after:w-full
            `}
          >
            Sign in
          </Link>
          {showOrganizerCta && (
            <Link
              href="/signup"
              className="hidden sm:inline-flex text-sm font-semibold bg-[#3B82F6] text-white px-4 py-2 rounded-lg hover:bg-[#2563EB] transition-colors duration-150"
            >
              List your event
            </Link>
          )}
        </div>

      </nav>
    </header>
  )
}
