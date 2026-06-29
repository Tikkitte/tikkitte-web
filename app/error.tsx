'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

function AlertTriangle() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16 text-center">

      {/* Brand logo */}
      <Link href="/" className="mb-14 flex items-center gap-2">
        <Image
          src="/images/logo.png"
          alt=""
          width={42}
          height={28}
          unoptimized
          priority
          style={{ width: 'auto', height: '28px' }}
        />
        <Image
          src="/images/text-logo-web.png"
          alt="Tikkitte"
          width={120}
          height={20}
          unoptimized
          priority
          style={{ height: '20px', width: 'auto' }}
        />
      </Link>

      {/* Icon badge */}
      <div className="mb-6 w-16 h-16 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center">
        <AlertTriangle />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
        Something went wrong
      </h1>

      <p className="text-gray-500 max-w-xs mx-auto mb-10 leading-relaxed">
        An unexpected error occurred. Try again — if it keeps happening, reach out to support.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] text-white font-semibold px-8 py-3.5 rounded-2xl transition-all duration-150 text-sm"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors py-2"
        >
          Go to home page
        </Link>
      </div>

    </div>
  )
}
