import Nav from './Nav'
import WatermarkText from './WatermarkText'

export default function OrganizerHero() {
  return (
    <section className="bg-white">
      <Nav showOrganizerCta />

      <div className="relative overflow-hidden border-b border-gray-100">
        {/* Watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-start justify-end pr-6 lg:pr-12 pt-12 select-none"
        >
          <WatermarkText text="SELL" />
        </div>

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 py-12 sm:py-20">
          {/* Eyebrow */}
          <span className="inline-block text-xs font-semibold tracking-widest text-[#3B82F6] uppercase mb-6">
            For organizers
          </span>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight max-w-3xl">
            Sell tickets to your event — instantly.
          </h1>

          <p className="mt-4 text-lg text-gray-500 max-w-lg leading-relaxed">
            Tikkitte puts your event in front of thousands of people actively looking for things to do.
            Set up in minutes, get paid directly.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <a
              href="/signup"
              className="inline-flex justify-center sm:justify-start bg-[#3B82F6] text-white text-sm font-semibold px-8 py-4 rounded-xl hover:bg-[#2563EB] transition-colors"
            >
              List your event →
            </a>
            <a
              href="#how-it-works"
              className="inline-flex justify-center sm:justify-start border border-gray-200 text-gray-700 text-sm font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
