'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

type EventOption = {
  id: string
  name: string
}

type Props = {
  events: EventOption[]
  selectedEventId: string
}

export default function EventPicker({ events, selectedEventId }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div>
      <label htmlFor="comp-ticket-event" className="mb-1.5 block text-sm font-medium text-gray-700">
        Event
      </label>
      <select
        id="comp-ticket-event"
        value={selectedEventId}
        disabled={isPending}
        aria-busy={isPending}
        onChange={(event) => {
          const nextEventId = event.target.value
          startTransition(() => {
            router.replace(`/admin/comp-tickets?event=${encodeURIComponent(nextEventId)}`, {
              scroll: false,
            })
          })
        }}
        className="min-h-11 w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus-visible:border-[#3d3d3d] focus-visible:ring-2 focus-visible:ring-[#3d3d3d]/20 disabled:cursor-wait disabled:bg-gray-50 disabled:text-gray-500"
      >
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-xs text-gray-500" aria-live="polite">
        {isPending ? 'Loading event tickets…' : 'Choose the event receiving the complimentary ticket.'}
      </p>
    </div>
  )
}
