'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function CancelButton({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('event').update({ cancelled: true }).eq('id', eventId)
    setLoading(false)
    setConfirming(false)
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setConfirming(false)}
          className="text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Keep event
        </button>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-sm font-semibold px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
        >
          {loading ? 'Cancelling...' : 'Yes, cancel event'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-sm font-semibold px-5 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
    >
      Cancel event
    </button>
  )
}
