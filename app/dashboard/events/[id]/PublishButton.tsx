'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'

export default function PublishButton({
  eventId,
  published,
}: {
  eventId: string
  published: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { data: updatedEvent, error: updateError } = await supabase
        .from('event')
        .update({ published: !published })
        .eq('id', eventId)
        .select('published, ever_published')
        .single()

      if (updateError || !updatedEvent || updatedEvent.published !== !published) {
        setError('Could not update publication status. Please try again.')
        return
      }

      if (!published) {
        router.push(`/dashboard/events/${eventId}?shared=1`)
      } else {
        setConfirming(false)
        router.refresh()
      }
    } catch {
      setError('Could not update publication status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClick = () => {
    setError(null)
    if (published) {
      setConfirming(true)
    } else {
      toggle()
    }
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`create-focus min-h-11 rounded-full px-6 text-sm font-semibold transition-colors disabled:opacity-60 ${
          published
            ? 'border border-[var(--tikkitte-cream-border)] bg-white text-[#4d4b44] hover:bg-[#f5f1e7]'
            : 'bg-[#2766d2] text-white hover:bg-[#1f56b5]'
        }`}
      >
        {loading ? '…' : published ? 'Unpublish' : 'Publish event'}
      </button>
      {error && !confirming && (
        <p className="mt-2 max-w-[280px] text-xs text-red-600" role="alert">
          {error}
        </p>
      )}

      <ConfirmDialog
        open={confirming}
        title="Unpublish this event?"
        description="The public event page and any live ticket or table reservation checkout will stop working until you publish again. Already-sold tickets, QR codes, and bookings are not affected."
        confirmLabel="Unpublish"
        confirmingLabel="Unpublishing…"
        cancelLabel="Keep published"
        danger
        loading={loading}
        error={error}
        onConfirm={toggle}
        onCancel={() => { setConfirming(false); setError(null) }}
      />
    </div>
  )
}
