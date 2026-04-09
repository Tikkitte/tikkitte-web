import Link from 'next/link'
import Nav from './Nav'
import PhoneCarousel from './PhoneCarousel'

export default function OrganizerHero() {
  return (
    <section className="bg-white">
      <Nav />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 sm:py-24">

        {/* Eyebrow */}
        <span className="inline-block text-xs font-semibold tracking-widest text-[#3B82F6] uppercase mb-6">
          For organizers
        </span>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-2xl mb-16">
          Sell tickets to your event — instantly.
        </h1>

        {/* Two-column: phone left, action cards right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Phone */}
          <div className="flex justify-center lg:justify-start">
            <PhoneCarousel minimal />
          </div>

          {/* Action cards */}
          <div className="flex flex-col gap-5">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-2">Get started</p>

            <Link
              href="/signup"
              className="group flex flex-col gap-2 bg-[#3B82F6] text-white rounded-2xl px-8 py-7 hover:bg-[#2563EB] transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold">List your event</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70 group-hover:translate-x-1 transition-transform duration-200">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <span className="text-blue-100 text-sm leading-relaxed">
                Create your event page in minutes. Set ticket types, prices, and capacity — then go live.
              </span>
            </Link>

            <Link
              href="/login"
              className="group flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-8 py-7 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">Organizer sign in</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:translate-x-1 transition-transform duration-200">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
              <span className="text-gray-400 text-sm leading-relaxed">
                Already have an account? Sign in to manage your events, track sales, and view attendees.
              </span>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
