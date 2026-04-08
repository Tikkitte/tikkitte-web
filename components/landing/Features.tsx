import Reveal from './Reveal'

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    title: 'Instant ticketing',
    description: 'Create your event, set your ticket tiers, and go live in minutes. No lengthy approval process.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h1m3 0h3M14 17h4M14 20h7" />
      </svg>
    ),
    title: 'QR code scanning',
    description: 'Every ticket gets a unique QR code. Scan at the door — fast, secure, no paper needed.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" /><path d="m7 16 4-4 4 4 4-8" />
      </svg>
    ),
    title: 'Real-time sales',
    description: 'Watch tickets sell in real time. See revenue, attendance, and ticket breakdown at a glance.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" />
      </svg>
    ),
    title: 'Built for Ghana',
    description: 'Payments in cedis via Paystack. No foreign currency confusion, no international fees.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: 'Automatic reminders',
    description: 'Attendees get push notifications 24 hours and 1 hour before your event. Fewer no-shows.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Built-in audience',
    description: 'Your event appears directly in the Tikkitte app to people actively looking for things to do.',
  },
]

export default function Features() {
  return (
    <section className="bg-white py-14 sm:py-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        <Reveal>
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold tracking-widest text-[#3B82F6] uppercase">
              Platform
            </span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Everything you need to run your event.
            </h2>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
              No spreadsheets, no manual transfers. Just a clean dashboard and happy attendees.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="bg-gray-50 rounded-2xl p-7 border border-gray-100 hover:border-blue-100 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 h-full">
                <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#3B82F6] mb-5 group-hover:border-blue-200 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
