import Image from 'next/image'
import Nav from './Nav'
import PhoneCarousel from './PhoneCarousel'
import CursorGlow from './CursorGlow'
import Reveal from './Reveal'

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.36.6 1.24 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
    </svg>
  )
}

export default function Hero() {
  return (
    <section className="bg-white relative overflow-hidden">
      {/* Cursor glow — follows mouse around the whole hero */}
      <CursorGlow />

      <Nav />

      {/* Hero content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 pt-24 pb-16 text-center">
        <Reveal>
          {/* Icon mark */}
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logo.png"
              alt="Tikkitte"
              width={96}
              height={64}
              unoptimized
              style={{ width: 'auto', height: '64px' }}
            />
          </div>

          {/* Eyebrow */}
          <span className="inline-block text-xs font-semibold tracking-widest text-[#3B82F6] uppercase mb-6">
            Now available in Ghana
          </span>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-[1.08] tracking-tight max-w-3xl mx-auto">
            Ghana&apos;s home<br />for live events.
          </h1>

          {/* Sub-headline */}
          <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Discover events near you and buy tickets in seconds.
            No account needed.
          </p>

          {/* App store buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <div>
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3.5 rounded-2xl hover:bg-gray-800 hover:scale-[1.03] active:scale-[0.98] transition-all duration-150"
              >
                <AppleIcon />
                <div className="text-left">
                  <p className="text-[10px] leading-none text-gray-400 font-medium">Download on the</p>
                  <p className="text-base font-semibold leading-tight mt-0.5">App Store</p>
                </div>
              </a>
            </div>
            <div>
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-gray-900 text-white px-6 py-3.5 rounded-2xl hover:bg-gray-800 hover:scale-[1.03] active:scale-[0.98] transition-all duration-150"
              >
                <PlayIcon />
                <div className="text-left">
                  <p className="text-[10px] leading-none text-gray-400 font-medium">Get it on</p>
                  <p className="text-base font-semibold leading-tight mt-0.5">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Phone mockup — floats */}
      <Reveal delay={200}>
        <div className="pb-24 relative z-10">
          <PhoneCarousel />
        </div>
      </Reveal>
    </section>
  )
}
