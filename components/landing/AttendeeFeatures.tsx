import Reveal from './Reveal'

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
        <path d="M14 14h1m3 0h3M14 17h4M14 20h7" />
      </svg>
    ),
    label: 'Seamless Tickets',
    title: 'Your ticket lives in your pocket.',
    description:
      'Every ticket comes with a unique QR code. Just open the app at the door — no printing, no screenshots, no stress.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    label: "Discover What's On",
    title: 'Find your next experience.',
    description:
      'Browse concerts, parties, sports, and more — all happening near you in Ghana. Updated in real time as new events go live.',
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    label: 'Never Miss a Show',
    title: 'Reminders that actually work.',
    description:
      'Get a push notification 24 hours and 1 hour before your event. You bought the ticket — we make sure you show up.',
  },
]

export default function AttendeeFeatures() {
  return (
    <section className="bg-gray-50 py-14 sm:py-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

        {/* Section header */}
        <Reveal>
          <div className="max-w-2xl mb-10 sm:mb-16">
            <span className="text-xs font-semibold tracking-widest text-[#3B82F6] uppercase">
              For event-goers
            </span>
            <h2 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
              Going out, made simple.
            </h2>
            <p className="mt-4 text-lg text-gray-500 leading-relaxed">
              From discovery to door entry — Tikkitte handles everything so you can just enjoy the night.
            </p>
          </div>
        </Reveal>

        {/* Feature grid — staggered */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <Reveal key={f.label} delay={i * 100}>
              <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#3B82F6] mb-6">
                  {f.icon}
                </div>
                <p className="text-xs font-semibold tracking-widest text-[#3B82F6] uppercase mb-2">
                  {f.label}
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{f.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
