'use client'

import { useState } from 'react'
import { requestEventCancellation } from './cancellation-actions'
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
    try {
      const result = await requestEventCancellation(eventId)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setConfirming(false)
      router.refresh()
    } catch {
      // The server action itself can fail to reach the server (offline phone).
      setError('We couldn’t reach Tikkitte. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setError(null); setConfirming(true) }}
        className="create-focus min-h-11 shrink-0 rounded-full border border-red-200 px-6 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        Cancel event
      </button>

      <ConfirmDialog
        open={confirming}
        title="Cancel this event?"
        description="Ticket sales stop now. Tikkitte will confirm the cancellation, then notify ticket holders and refund them in full. This can't be undone."
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
