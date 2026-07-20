'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
        router.refresh()
      }
    } catch {
      setError('Could not update publication status. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={toggle}
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
      {error && (
        <p className="text-xs text-red-600 max-w-[280px] text-right" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
