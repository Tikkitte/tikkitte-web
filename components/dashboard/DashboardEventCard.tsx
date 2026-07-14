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
}

export default function DashboardEventCard({ event, tickets }: Props) {
  const [copied, setCopied] = useState(false)
  const sold = tickets.reduce((s, t) => s + t.purchased_quantity, 0)
  const capacity = tickets.some((t) => t.total_quantity === null)
    ? null
    : tickets.reduce((s, t) => s + (t.total_quantity ?? 0), 0)
  const revenue = tickets.reduce((s, t) => s + t.purchased_quantity * t.price, 0)
  const status = eventStatus(event)
  const poster = event.image?.[0]
  const eventUrl = `https://tikkitte.com/e/${event.slug ?? event.id}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(eventUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
      <div className="relative aspect-[4/5] bg-gray-100">
        {poster ? (
          <div className="absolute inset-0">
            <PosterFrame src={poster} alt={event.name} sizes="(max-width: 1024px) 100vw, 33vw" className="h-full w-full" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
              <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
            </svg>
          </div>
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color} backdrop-blur-sm`}>
          {status.label}
        </span>
        {event.published && (
          <button
            type="button"
            onClick={copyLink}
            aria-label="Copy event link"
            title="Copy event link"
            className="absolute top-3 right-3 inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-white/95 px-2 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur hover:bg-white hover:text-[#3d3d3d] transition-colors"
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

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-base mb-1 line-clamp-1">{event.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{formatDate(event.date)} · {event.venue ?? 'No venue'}</p>

        <div className="flex gap-4 mb-4 mt-auto">
          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-gray-900 leading-tight">
              {sold}{capacity !== null ? <span className="text-gray-400 text-sm font-normal">/{capacity}</span> : ''}
            </p>
            <p className="text-xs text-gray-500">Sold</p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-gray-900 leading-tight">GHS {revenue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Revenue</p>
          </div>
        </div>

        <Link
          href={`/dashboard/events/${event.id}`}
          className="w-full bg-gray-900 text-white text-sm font-semibold py-2.5 rounded-lg text-center hover:bg-gray-800 transition-colors"
        >
          View details
        </Link>
      </div>
    </div>
  )
}
