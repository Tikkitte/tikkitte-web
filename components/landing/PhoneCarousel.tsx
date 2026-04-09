'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const slides = [
  {
    src: '/screenshots/home.png',
    label: 'Discover events near you',
    caption: 'Browse local events, buy tickets instantly, and never miss out.',
  },
  {
    src: '/screenshots/explore.png',
    label: "Explore what's on",
    caption: 'Filter by category, date, and location to find your next night out.',
  },
  {
    src: '/screenshots/ticket-qr.png',
    label: 'Your ticket, always ready',
    caption: 'Unique QR code per ticket. Just show your phone at the door.',
  },
  {
    src: '/screenshots/login.png',
    label: 'Secure sign-in',
    caption: 'Your account, your tickets, safe and accessible anywhere.',
  },
]

export default function PhoneCarousel({ minimal = false }: { minimal?: boolean }) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(i => (i + 1) % slides.length), 3500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col items-center gap-8">
      {/* iPhone mockup — floats up/down on loop */}
      <div className="relative animate-float" style={{ width: 280, height: 585 }}>
        <div
          className="absolute inset-0 rounded-[48px] border-[10px] border-gray-900 bg-gray-900 overflow-hidden"
          style={{ boxShadow: '0 0 0 2px #374151, 0 32px 80px rgba(0,0,0,0.25)' }}
        >
          <div className="absolute inset-0 bg-black overflow-hidden rounded-[38px]">
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
                  sizes="280px"
                  className="object-fill"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="absolute left-[-11px] top-[105px] w-[4px] h-6 bg-gray-700 rounded-l-sm" />
        <div className="absolute left-[-11px] top-[153px] w-[4px] h-12 bg-gray-700 rounded-l-sm" />
        <div className="absolute left-[-11px] top-[217px] w-[4px] h-12 bg-gray-700 rounded-l-sm" />
        <div className="absolute right-[-11px] top-[162px] w-[4px] h-16 bg-gray-700 rounded-r-sm" />
      </div>

      {!minimal && (
        <>
          {/* Caption */}
          <div className="text-center h-12">
            <p className="text-sm font-semibold text-gray-900 mb-1">{slides[active].label}</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">{slides[active].caption}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActive(i => (i - 1 + slides.length) % slides.length)}
              aria-label="Previous"
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              ‹
            </button>

            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === active
                      ? 'w-5 h-2 bg-[#3B82F6]'
                      : 'w-2 h-2 bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setActive(i => (i + 1) % slides.length)}
              aria-label="Next"
              className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              ›
            </button>
          </div>
        </>
      )}
    </div>
  )
}
