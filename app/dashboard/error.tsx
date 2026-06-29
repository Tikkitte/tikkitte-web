'use client'

import { useEffect } from 'react'

function AlertTriangle() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1d67ba" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-28 px-6 text-center">

      {/* Icon badge */}
      <div className="mb-5 w-14 h-14 rounded-2xl bg-[#1d67ba]/10 flex items-center justify-center">
        <AlertTriangle />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
        Something went wrong
      </h2>
      <p className="text-sm text-gray-500 mb-8 max-w-xs leading-relaxed">
        An error occurred loading this page. Your data is safe — try refreshing or clicking below.
      </p>

      <button
        onClick={reset}
        className="bg-[#1d67ba] hover:bg-[#1555a0] active:scale-[0.98] text-white font-semibold px-7 py-3 rounded-xl transition-all duration-150 text-sm"
      >
        Try again
      </button>

    </div>
  )
}
