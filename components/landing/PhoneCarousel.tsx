'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

const slides = [
  {
    src: '/screenshots/home.png',
    label: 'Discover events near you',
    caption: 'Browse local events, buy tickets instantly, and never miss out.',
  },
  {
    src: '/screenshots/explore.png',
    label: 'Explore what\'s on',
    caption: 'Filter by category, date, and location to find your next night out.',
  },
  {
    src: '/screenshots/ticket-qr.png',
    label: 'Your ticket, always ready',
    caption: 'Unique QR code per ticket — just show your phone at the door.',
  },
  {
    src: '/screenshots/login.png',
    label: 'Secure sign-in',
    caption: 'Your account, your tickets, safe and accessible anywhere.',
  },
]

export default function PhoneCarousel() {
  const [active, setActive] = useState(0)

  const next = useCallback(() => setActive(i => (i + 1) % slides.length), [])
  const prev = useCallback(() => setActive(i => (i - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    const t = setInterval(next, 3500)
    return () => clearInterval(t)
  }, [next])

  return (
    <section className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-3">
          See the app in action
        </h2>
        <p className="text-gray-500 text-lg text-center mb-10 max-w-lg">
          A seamless experience for attendees — from discovery to door entry.
        </p>

        <div className="flex flex-col items-center gap-8">
          {/* iPhone mockup — 320×670 matches 1320×2868 screenshot ratio */}
          <div className="relative" style={{ width: 320, height: 670 }}>
            {/* Phone shell */}
            <div
              className="absolute inset-0 rounded-[52px] border-[11px] border-gray-900 bg-gray-900 overflow-hidden"
              style={{ boxShadow: '0 0 0 2px #374151, 0 32px 80px rgba(0,0,0,0.4)' }}
            >
              {/* Screen — no fake notch, screenshots already include dynamic island */}
              <div className="absolute inset-0 bg-black overflow-hidden rounded-[42px]">
                {slides.map((slide, i) => (
                  <div
                    key={slide.src}
                    className="absolute inset-0 transition-opacity duration-700"
                    style={{ opacity: i === active ? 1 : 0 }}
                  >
                    <Image
                      src={slide.src}
                      alt={slide.label}
                      fill
                      className="object-fill"
                      priority={i === 0}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Volume silent switch */}
            <div className="absolute left-[-12px] top-[120px] w-[4px] h-7 bg-gray-700 rounded-l-sm" />
            {/* Volume up */}
            <div className="absolute left-[-12px] top-[175px] w-[4px] h-14 bg-gray-700 rounded-l-sm" />
            {/* Volume down */}
            <div className="absolute left-[-12px] top-[248px] w-[4px] h-14 bg-gray-700 rounded-l-sm" />
            {/* Power button */}
            <div className="absolute right-[-12px] top-[185px] w-[4px] h-20 bg-gray-700 rounded-r-sm" />
          </div>

          {/* Caption */}
          <div className="text-center h-14">
            <p className="text-base font-semibold text-gray-900 mb-1">{slides[active].label}</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">{slides[active].caption}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-5">
            <button
              onClick={prev}
              aria-label="Previous"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              ‹
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === active
                      ? 'w-6 h-2.5 bg-[#1d67ba]'
                      : 'w-2.5 h-2.5 bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={next}
              aria-label="Next"
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
