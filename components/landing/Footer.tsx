import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-3 mb-3">
              <Image
                src="/images/logo.png"
                alt=""
                width={54}
                height={36}
                unoptimized
                style={{ width: 'auto', height: '36px', display: 'block' }}
              />
              <Image
                src="/images/text-logo-web.png"
                alt="Tikkitte"
                width={120}
                height={20}
                unoptimized
                style={{ height: '20px', width: 'auto', display: 'block' }}
              />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Event ticketing for Ghana.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
              Explore
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/events" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Browse events
                </Link>
              </li>
              <li>
                <Link href="/organizers" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Sell tickets
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                  Organizer sign in
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-4">
              Contact
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:admin@tikkitte.com"
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  admin@tikkitte.com
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Tikkitte. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
