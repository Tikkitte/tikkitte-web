'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

function AlertTriangle() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2565D0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F2EC] px-6 py-16 text-center font-grotesk">

      {/* Brand logo */}
      <Link href="/" className="mb-14 flex items-center gap-2">
        <Image
          src="/images/logo.png"
          alt=""
          width={42}
          height={28}
          preload
          style={{ width: 'auto', height: '28px' }}
        />
        <Image
          src="/images/text-logo-web.png"
          alt="Tikkitte"
          width={120}
          height={20}
          preload
          style={{ height: '20px', width: 'auto' }}
        />
      </Link>

      {/* Icon badge */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#2565D0]/10">
        <AlertTriangle />
      </div>

      <h1 className="mb-4 font-anton font-normal text-4xl uppercase tracking-normal text-[#191917] sm:text-5xl">
        Something went wrong
      </h1>

      <p className="mx-auto mb-10 max-w-xs leading-relaxed text-[#5F5D54]">
        An unexpected error occurred. Try again — if it keeps happening, reach out to support.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center rounded-full bg-[#2565D0] px-8 py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#1E56B5] active:scale-[0.98]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="py-2 text-sm font-medium text-[#8a887c] transition-colors hover:text-[#191917]"
        >
          Go to home page
        </Link>
      </div>

    </div>
  )
}
