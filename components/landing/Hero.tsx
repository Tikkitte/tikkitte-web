'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo-square.png" alt="Tikkitte" width={32} height={32} className="rounded-lg" />
          <span className="text-2xl font-extrabold text-[#1d67ba] tracking-tight">Tikkitte</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-[#1d67ba] text-white px-4 py-2 rounded-lg hover:bg-[#1555a0] transition-colors"
          >
            Request access
          </Link>
        </div>
      </nav>

      {/* Hero content */}
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-16 text-center">
        <div className="inline-block bg-blue-50 text-[#1d67ba] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          Now available in Ghana
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight max-w-3xl mx-auto">
          Sell tickets to your event — instantly
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Tikkitte puts your event in front of thousands of people actively looking for things to do.
          Set up in minutes, get paid directly.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-[#1d67ba] text-white text-base font-semibold px-8 py-4 rounded-xl hover:bg-[#1555a0] transition-colors shadow-sm"
          >
            List your event →
          </Link>
          <a
            href="#how-it-works"
            className="border border-gray-200 text-gray-700 text-base font-semibold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            See how it works
          </a>
        </div>
      </div>
    </section>
  )
}
