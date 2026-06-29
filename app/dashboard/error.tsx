'use client'

import { useEffect } from 'react'

export default function DashboardError({
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
    <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
      <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-sm">
        An error occurred loading this page. Try again or refresh — your data is safe.
      </p>
      <button
        onClick={reset}
        className="bg-[#1d67ba] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#1555a0] transition-colors text-sm"
      >
        Try again
      </button>
    </div>
  )
}
