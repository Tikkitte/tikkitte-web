import Link from 'next/link'
import Image from 'next/image'

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <header className="border-b border-gray-100 dark:border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-slate-500">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <Image src="/images/logo.png" alt="Tikkitte" width={24} height={24} />
            <span className="text-lg font-extrabold text-[#1d67ba] tracking-tight">Tikkitte</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-[#1d67ba] dark:hover:text-[#1d67ba] transition-colors"
          >
            Browse events
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-slate-900 text-slate-400 px-4 py-6 mt-8">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span>Powered by Tikkitte &middot; Event Ticketing for Ghana</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-white transition-colors">Events</Link>
            <Link href="/organizers" className="hover:text-white transition-colors">Sell tickets</Link>
            <a href="mailto:admin@tikkitte.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
