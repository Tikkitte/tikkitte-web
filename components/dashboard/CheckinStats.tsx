'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  eventId: string
  totalSold: number
  initialCheckedIn: number
  scannerPin: string | null
}

export default function CheckinStats({ eventId, totalSold, initialCheckedIn, scannerPin }: Props) {
  const [checkedIn, setCheckedIn] = useState(initialCheckedIn)
  const [copied, setCopied] = useState(false)

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
            setCheckedIn(n => n + 1)
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId])

  const pct = totalSold > 0 ? Math.round((checkedIn / totalSold) * 100) : 0

  function copyPin() {
    if (!scannerPin) return
    navigator.clipboard.writeText(scannerPin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-0.5">Checked in</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {checkedIn}
            <span className="text-gray-400 dark:text-slate-500 text-sm font-normal">/{totalSold}</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{pct}% of attendees</p>
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/40">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-800 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-green-500 transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {/* PIN */}
      {scannerPin ? (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-slate-500">Scanner PIN:</span>
          <span className="font-mono font-bold text-sm text-gray-900 dark:text-white tracking-[0.2em]">{scannerPin}</span>
          <button
            onClick={copyPin}
            className="text-xs text-[#1d67ba] hover:text-[#1555a0] font-medium transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <a
            href="/scan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors ml-auto"
          >
            Open scanner ↗
          </a>
        </div>
      ) : (
        <p className="text-xs text-gray-400 dark:text-slate-500">
          No scanner PIN set.{' '}
          <a href={`/dashboard/events/${eventId}/edit`} className="text-[#1d67ba] hover:underline">Edit event</a> to generate one.
        </p>
      )}
    </div>
  )
}
