'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PublishButton({ eventId, published }: { eventId: string; published: boolean }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase.from('event').update({ published: !published }).eq('id', eventId)
    if (!published) {
      router.push(`/dashboard/events/${eventId}?shared=1`)
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  return (
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
  )
}
