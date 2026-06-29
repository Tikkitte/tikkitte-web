'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-gray-500 mb-6">
          An unexpected error occurred. Try reloading — if it keeps happening, contact support.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-[#1d67ba] text-white font-semibold py-3 rounded-lg hover:bg-[#1555a0] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
          >
            Go to home page
          </Link>
        </div>
      </div>
    </div>
  )
}
