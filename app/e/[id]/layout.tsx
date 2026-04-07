import Link from 'next/link'
import Image from 'next/image'

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">

          {/* Back → events list */}
          <Link
            href="/events"
            className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors duration-150 group"
          >
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:-translate-x-0.5 transition-transform duration-150"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            <Image
              src="/images/text-logo-web.png"
              alt="Tikkitte"
              width={144}
              height={24}
              unoptimized
              style={{ height: '24px', width: 'auto', display: 'block' }}
            />
          </Link>

          <Link
            href="/events"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            All events
          </Link>

        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-12">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <span>Powered by Tikkitte &middot; Event Ticketing for Ghana</span>
          <div className="flex gap-4">
            <Link href="/events" className="hover:text-gray-900 transition-colors">Events</Link>
            <Link href="/organizers" className="hover:text-gray-900 transition-colors">Sell tickets</Link>
            <a href="mailto:admin@tikkitte.com" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
