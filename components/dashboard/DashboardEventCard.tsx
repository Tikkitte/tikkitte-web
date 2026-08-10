'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { Event, Ticket } from '@/lib/types'
import PosterFrame from '@/components/PosterFrame'

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return 'TBA'
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function eventStatus(event: Event): { label: string; color: string } {
  if (!event.published) return { label: 'Draft', color: 'text-purple-700 bg-purple-50' }
  if (event.cancelled) return { label: 'Cancelled', color: 'text-red-600 bg-red-50' }
  const today = new Date().toISOString().slice(0, 10)
  if (event.date < today) return { label: 'Past', color: 'text-gray-500 bg-gray-100' }
  return { label: 'Upcoming', color: 'text-green-700 bg-green-50' }
}

type Props = {
  event: Event
  tickets: Ticket[]
  grossCollected: number
}

export default function DashboardEventCard({ event, tickets, grossCollected }: Props) {
  const [copied, setCopied] = useState(false)
  const sold = tickets.reduce((s, t) => s + t.purchased_quantity, 0)
  const capacity = tickets.some((t) => t.total_quantity === null)
    ? null
    : tickets.reduce((s, t) => s + (t.total_quantity ?? 0), 0)
  const status = eventStatus(event)
  const poster = event.image?.[0]
  const eventUrl = `https://tikkitte.com/e/${event.slug ?? event.id}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(eventUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <article className="create-card relative flex min-h-[126px] overflow-hidden p-3 transition-shadow hover:shadow-lg sm:block sm:p-0">
      <div className="relative h-[108px] w-[88px] shrink-0 overflow-hidden rounded-[14px] bg-[#191917] sm:aspect-[4/5] sm:h-auto sm:w-auto sm:rounded-none">
        {poster ? (
          <div className="absolute inset-0">
            <PosterFrame src={poster} alt={event.name} sizes="(max-width: 1024px) 100vw, 33vw" className="h-full w-full" />
          </div>
        ) : (
          <div className="create-display flex h-full w-full items-center justify-center text-lg text-white">
            {event.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
          </div>
        )}
        <span className={`absolute left-3 top-3 hidden rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm sm:block ${status.color}`}>
          {status.label}
        </span>
        {event.published && (
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy event link"
            title="Copy event link"
            className="create-focus absolute right-3 top-3 hidden h-9 min-w-9 items-center justify-center rounded-full bg-white/95 px-2 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-[#2565d0] sm:inline-flex"
          >
            {copied ? (
              'Copied!'
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col px-4 py-2 sm:p-5">
        <h3 className="create-display mb-1 line-clamp-2 text-[17px]">{event.name}</h3>
        <p className="mb-3 truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2565d0]">{formatDate(event.date)} · {event.venue ?? 'No venue'}</p>

        <div className="mb-4 mt-auto hidden gap-4 sm:flex">
          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-gray-900 leading-tight">
              {sold}{capacity !== null ? <span className="text-gray-400 text-sm font-normal">/{capacity}</span> : ''}
            </p>
            <p className="text-xs text-gray-500">Sold</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-gray-900 leading-tight">GHS {grossCollected.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Gross collected</p>
          </div>
        </div>

        <div className="mt-auto sm:hidden">
          <div className="mb-2 flex justify-end text-xs text-[var(--tikkitte-ink-soft)]">{sold}{capacity !== null ? `/${capacity}` : ''}</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--tikkitte-cream-border)]"><div className="h-full rounded-full bg-[#2e6fe6]" style={{ width: `${capacity ? Math.min(100, sold / capacity * 100) : 0}%` }} /></div>
        </div>

        <Link
          href={`/dashboard/events/${event.id}`}
          className="create-focus hidden w-full rounded-full bg-[#191917] py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-black sm:block"
        >
          View details
        </Link>
      </div>
      <Link href={`/dashboard/events/${event.id}`} className="create-focus absolute inset-0 rounded-[18px] sm:hidden"><span className="sr-only">View {event.name}</span></Link>
    </article>
  )
}
