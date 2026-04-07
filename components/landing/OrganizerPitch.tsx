import Link from 'next/link'
import Reveal from './Reveal'

const benefits = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    text: 'Go live in minutes — sell out faster, grow your audience.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h1m3 0h3M14 17h4M14 20h7" />
      </svg>
    ),
    text: 'QR scanning at the door — fast, secure entry.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    ),
    text: 'Paid directly in cedis via Paystack — no delays.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    text: 'Built-in audience actively looking for events.',
  },
]

export default function OrganizerPitch() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <Reveal>
            <div>
              <span className="text-xs font-semibold tracking-widest text-[#3B82F6] uppercase">
                For organizers
              </span>
              <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Running an event?
              </h2>
              <p className="mt-5 text-lg text-gray-500 leading-relaxed max-w-md">
                List your event on Tikkitte and reach thousands of people actively looking for something to do.
                Set up in minutes — get paid directly.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/signup"
                  className="inline-flex justify-center sm:justify-start bg-[#3B82F6] text-white text-sm font-semibold px-6 py-3.5 rounded-xl hover:bg-[#2563EB] hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                >
                  List your event →
                </Link>
                <Link
                  href="/organizers"
                  className="inline-flex justify-center sm:justify-start border border-gray-200 text-gray-700 text-sm font-semibold px-6 py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-150"
                >
                  Learn more
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Right — benefits */}
          <Reveal delay={150}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((b) => (
                <div
                  key={b.text}
                  className="flex items-start gap-3 bg-gray-50 rounded-xl p-5 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#3B82F6] mt-0.5">
                    {b.icon}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">{b.text}</p>
                </div>
              ))}
            </div>
          </Reveal>

        </div>
      </div>
    </section>
  )
}
