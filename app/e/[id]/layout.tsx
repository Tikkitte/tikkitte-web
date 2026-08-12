import Link from 'next/link'
import Image from 'next/image'

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F2EC] font-grotesk text-[#191917]">

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[#E7E2D4] bg-[#F4F2EC]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6 lg:px-12">

          {/* Back → events list */}
          <Link
            href="/events"
            className="group flex items-center gap-2 text-[#8a887c] transition-colors duration-150 hover:text-[#191917]"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:-translate-x-0.5 transition-transform duration-150 flex-shrink-0"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <Image
              src="/images/logo.png"
              alt=""
              width={42}
              height={28}
              style={{ width: 'auto', height: '24px', display: 'block', flexShrink: 0 }}
            />
            <Image
              src="/images/text-logo-web.png"
              alt="Tikkitte"
              width={120}
              height={20}
              style={{ height: '18px', width: 'auto', display: 'block' }}
            />
          </Link>

          <Link
            href="/events"
            className="whitespace-nowrap rounded-full border border-[#C8C3B2] px-4 py-2 text-sm font-semibold text-[#5F5D54] transition-colors hover:border-[#191917] hover:text-[#191917]"
          >
            All events
          </Link>

        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#E7E2D4] bg-[#F4F2EC] py-6">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-3 px-6 text-xs text-[#8a887c] sm:flex-row lg:px-12">
          <span>Powered by Tikkitte &middot; Event Ticketing for Ghana</span>
          <div className="flex gap-4">
            <Link href="/events" className="transition-colors hover:text-[#191917]">Events</Link>
            <Link href="/organizers" className="transition-colors hover:text-[#191917]">Sell tickets</Link>
            <a href="mailto:admin@tikkitte.com" className="transition-colors hover:text-[#191917]">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
