'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'

export default function PublishButton({
  eventId,
  published,
  everPublished,
}: {
  eventId: string
  published: boolean
  everPublished: boolean
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
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-sm disabled:opacity-60 ${
          published
            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {loading ? '…' : published ? 'Unpublish' : 'Publish event'}
      </button>
      {!everPublished && (
        <p className="text-xs text-gray-500 max-w-[280px] text-right">
          After publishing, saved ticket types cannot be removed, even if you unpublish later. You can still edit their details and sale windows.
        </p>
      )}
      {error && !confirming && (
        <p className="text-xs text-red-600 max-w-[280px] text-right" role="alert">
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
