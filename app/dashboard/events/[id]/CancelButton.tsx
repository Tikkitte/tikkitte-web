'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'

export default function CancelButton({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCancel = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error: updateError } = await supabase.from('event').update({ cancelled: true }).eq('id', eventId)
    setLoading(false)
    if (updateError) {
      setError('Could not cancel this event. Please try again.')
      return
    }
    setConfirming(false)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => { setError(null); setConfirming(true) }}
        className="text-sm font-semibold px-5 py-2.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
      >
        Cancel event
      </button>

      <ConfirmDialog
        open={confirming}
        title="Cancel this event?"
        description="Ticket holders will be notified and automatically refunded in full via Paystack. This can't be undone."
        confirmLabel="Yes, cancel event"
        confirmingLabel="Cancelling…"
        cancelLabel="Keep event"
        danger
        loading={loading}
        error={error}
        onConfirm={handleCancel}
        onCancel={() => { setConfirming(false); setError(null) }}
      />
    </>
  )
}
