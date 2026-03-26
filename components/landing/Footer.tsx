import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Tikkitte" width={36} height={36} className="opacity-90" />
            <div>
              <span className="text-xl font-extrabold text-white tracking-tight">Tikkitte</span>
              <p className="text-sm mt-0.5">Event ticketing for Ghana</p>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-2">
            <Link href="/" className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              Browse events
            </Link>
            <Link href="/organizers" className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              Sell tickets
            </Link>
            <Link href="/login" className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              Organizer sign in
            </Link>
            <a href="mailto:admin@tikkitte.com" className="px-4 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              Contact us
            </a>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Tikkitte. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
