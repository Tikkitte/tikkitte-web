'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

type Props = {
  showOrganizerCta?: boolean // kept for compatibility but no longer used
}

const links = [
  { label: 'Home', href: '/' },
  { label: 'Browse Events', href: '/events' },
  { label: 'Organizers', href: '/organizers' },
  { label: 'About', href: '/about' },
]

export default function Nav({ showOrganizerCta = false }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white border-b transition-all duration-300 ${
          scrolled
            ? 'border-gray-200 shadow-[0_1px_12px_rgba(0,0,0,0.06)]'
            : 'border-gray-100 shadow-none'
        }`}
      >
        <nav className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between gap-8">

          {/* Logo — col 1 */}
          <div className="flex-shrink-0 select-none flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt=""
              width={42}
              height={28}
              priority
              unoptimized
              style={{ width: 'auto', height: '24px', display: 'block', flexShrink: 0 }}
            />
            <Image
              src="/images/text-logo-web.png"
              alt="Tikkitte"
              width={120}
              height={20}
              priority
              unoptimized
              style={{ height: '18px', width: 'auto', display: 'block' }}
            />
          </div>

          {/* Desktop centre links */}
          <div className="hidden md:flex items-center gap-8">
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

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-[5px] rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-all duration-200 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 rounded transition-all duration-200 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>

        </nav>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`md:hidden fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-100">
          <Image
            src="/images/logo.png"
            alt="Tikkitte"
            width={54}
            height={36}
            unoptimized
            style={{ height: '32px', width: 'auto', display: 'block' }}
          />
          <button
            onClick={() => setMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer links */}
        <nav className="flex-1 flex flex-col px-4 py-6 gap-1">
          {links.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-3 py-3 rounded-xl transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Drawer CTA */}
        <div className="px-4 pb-8 flex flex-col gap-3">
          <Link
            href="/signup"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center text-sm font-semibold bg-[#3B82F6] text-white px-4 py-3 rounded-xl hover:bg-[#2563EB] transition-colors"
          >
            List your event
          </Link>
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Organizer sign in
          </Link>
        </div>
      </div>
    </>
  )
}
