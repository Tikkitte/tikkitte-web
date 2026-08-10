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
      <label htmlFor="comp-ticket-event" className="mb-1.5 block text-sm font-medium">
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
        className="create-input min-h-11 text-sm disabled:cursor-wait disabled:bg-[var(--tikkitte-cream)] disabled:text-[var(--tikkitte-ink-faint)]"
      >
        {events.map((event) => (
          <option key={event.id} value={event.id}>
            {event.name}
          </option>
        ))}
      </select>
      <p className="mt-1.5 text-xs text-[var(--tikkitte-ink-faint)]" aria-live="polite">
        {isPending ? 'Loading event tickets…' : 'Choose the event receiving the complimentary ticket.'}
      </p>
    </div>
  )
}
