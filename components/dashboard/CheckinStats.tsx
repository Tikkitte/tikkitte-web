'use client'

import { useState, useEffect } from 'react'
import ScannerAccess from './ScannerAccess'
import { createClient } from '@/lib/supabase/client'

type Props = {
  eventId: string
  totalSold: number
  initialCheckedIn: number
  doorsAt?: string
}

export default function CheckinStats({ eventId, totalSold, initialCheckedIn, doorsAt }: Props) {
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`checkins-${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_ticket',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.new.used && !payload.old.used) {
            setCheckedIn(n => n + Number(payload.new.quantity ?? 1))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  const pct = totalSold > 0 ? Math.round((checkedIn / totalSold) * 100) : 0

  return (
    <section className="create-card flex flex-col gap-5 p-5 sm:p-[22px] lg:flex-row lg:items-center lg:gap-7" aria-label="Event check-in">
      <div className="min-w-0 flex-1">
        <p className="mb-2.5 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">
          Check-in{doorsAt ? ` · doors at ${doorsAt}` : ''}
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--tikkitte-cream)]">
          <div className="h-full rounded-full bg-[#2e6fe6] transition-[width] duration-500" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <p className="mt-2 text-xs text-[var(--tikkitte-ink-faint)]">{checkedIn.toLocaleString()} of {totalSold.toLocaleString()} attendees checked in</p>
      </div>

      <div className="min-w-0 flex-1 rounded-[14px] border border-dashed border-[var(--tikkitte-cream-border)] p-4">
        <ScannerAccess key={eventId} eventId={eventId} />
      </div>
    </section>
  )
}
