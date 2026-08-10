'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  eventId: string
  totalSold: number
  initialCheckedIn: number
  scannerPin: string | null
  doorsAt?: string
}

export default function CheckinStats({ eventId, totalSold, initialCheckedIn, scannerPin, doorsAt }: Props) {
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn)
  const [copyStatus, setCopyStatus] = useState('')

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

  async function copyPin() {
    if (!scannerPin) return
    try {
      await navigator.clipboard.writeText(scannerPin)
      setCopyStatus('Scanner PIN copied.')
    } catch {
      setCopyStatus('Could not copy the scanner PIN.')
    }
    window.setTimeout(() => setCopyStatus(''), 2000)
  }

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

      {scannerPin ? (
        <div className="flex flex-wrap items-center gap-3 rounded-[14px] border-[1.5px] border-dashed border-[#b9cff5] bg-[#eaf1fc] px-[18px] py-3 sm:flex-nowrap">
          <div className="mr-auto min-w-[102px]">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#2565d0]">Scanner PIN</p>
            <p className="create-display mt-1 text-[26px] tracking-[0.28em] text-[#191917]">{scannerPin}</p>
          </div>
          <button
            type="button"
            onClick={copyPin}
            className="create-focus min-h-9 rounded-full border border-[#b9cff5] bg-white px-4 text-xs font-semibold text-[#2565d0] transition-colors hover:bg-[#f7faff]"
          >
            {copyStatus.startsWith('Scanner') ? 'Copied' : 'Copy'}
          </button>
          <a
            href="/scan"
            target="_blank"
            rel="noopener noreferrer"
            className="create-focus flex min-h-9 items-center rounded-full bg-[#191917] px-5 text-xs font-semibold text-white transition-colors hover:bg-[#30302b]"
          >
            Open scanner ↗
          </a>
          <p className="sr-only" aria-live="polite">{copyStatus}</p>
        </div>
      ) : (
        <p className="rounded-[14px] border border-dashed border-[var(--tikkitte-cream-border)] px-5 py-4 text-xs text-[var(--tikkitte-ink-faint)]">
          No scanner PIN set.{' '}
          <a href={`/dashboard/events/${eventId}/edit`} className="create-focus font-semibold text-[#2565d0] hover:underline">Edit event</a> to generate one.
        </p>
      )}
    </section>
  )
}
