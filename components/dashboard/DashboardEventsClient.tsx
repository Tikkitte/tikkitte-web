'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { Event, Ticket } from '@/lib/types'
import DashboardEventCard from './DashboardEventCard'

type EventFilter = 'all' | 'upcoming' | 'past' | 'drafts'

const filters: EventFilter[] = ['all', 'upcoming', 'past', 'drafts']

const filterLabels: Record<EventFilter, string> = {
  all: 'All',
  upcoming: 'Upcoming',
  past: 'Past',
  drafts: 'Drafts',
}

const emptyStateCopy: Record<EventFilter, string> = {
  all: 'Create your first event to start selling tickets.',
  upcoming: 'No upcoming events. Create one to get started.',
  past: 'No past events yet.',
  drafts: 'No drafts. When you save an event it will appear here.',
}

function parseFilter(value: string | null | undefined): EventFilter {
  return value === 'all' || value === 'past' || value === 'drafts' ? value : 'upcoming'
}

type Props = {
  events: Event[]
  tickets: Ticket[]
  grossCollectedByEvent: Record<string, number>
  initialFilter: EventFilter
}

export default function DashboardEventsClient({ events: allEvents, tickets, grossCollectedByEvent, initialFilter }: Props) {
  const [filter, setFilter] = useState<EventFilter>(initialFilter)

  useEffect(() => {
    const syncFilter = () => {
      setFilter(parseFilter(new URLSearchParams(window.location.search).get('filter')))
    }
    window.addEventListener('popstate', syncFilter)
    return () => window.removeEventListener('popstate', syncFilter)
  }, [])

  const { eventsByFilter, tabCounts } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    const upcoming = allEvents
      .filter((event) => event.published === true && event.date >= today && !event.cancelled)
      .sort((a, b) => a.date.localeCompare(b.date))
    const past = allEvents
      .filter((event) => event.published === true && (event.date < today || event.cancelled))
      .sort((a, b) => b.date.localeCompare(a.date))
    const drafts = allEvents
      .filter((event) => event.published === false)
      .sort((a, b) => b.date.localeCompare(a.date))
    const eventsByFilter = {
      all: [...upcoming, ...drafts, ...past],
      upcoming,
      past,
      drafts,
    }
    return {
      eventsByFilter,
      tabCounts: {
        all: allEvents.length,
        upcoming: upcoming.length,
        past: past.length,
        drafts: drafts.length,
      },
    }
  }, [allEvents])

  const visibleEvents = eventsByFilter[filter]
  const visibleEventIds = new Set(visibleEvents.map((event) => event.id))
  const visibleTickets = tickets.filter((ticket) => visibleEventIds.has(ticket.event_id))
  const ticketsByEvent = tickets.reduce((acc: Record<string, Ticket[]>, ticket) => {
    if (!acc[ticket.event_id]) acc[ticket.event_id] = []
    acc[ticket.event_id].push(ticket)
    return acc
  }, {})
  const totalEvents = visibleEvents.length
  const totalSold = visibleTickets.reduce((s, ticket) => s + ticket.purchased_quantity, 0)
  const totalCollected = visibleEvents.reduce(
    (sum, event) => sum + (grossCollectedByEvent[event.id] ?? 0),
    0,
  )

  const selectFilter = (nextFilter: EventFilter) => {
    setFilter(nextFilter)
    const url = new URL(window.location.href)
    if (nextFilter === 'upcoming') {
      url.searchParams.delete('filter')
    } else {
      url.searchParams.set('filter', nextFilter)
    }
    window.history.pushState(null, '', `${url.pathname}${url.search}`)
  }

  return (
    <>
      <div className="mb-6 overflow-x-auto">
        <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-[var(--tikkitte-cream-border)]">
          {filters.map((tab) => {
            const active = filter === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => selectFilter(tab)}
                aria-pressed={active}
                className={`create-focus whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-[#191917] text-white'
                    : 'text-[#8a887c] hover:text-[#191917]'
                }`}
              >
                {filterLabels[tab]} ({tabCounts[tab]})
              </button>
            )
          })}
        </div>
      </div>

      {totalEvents > 0 && (
        <div className="mb-8 hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-3">
          <div className="create-card p-5">
            <p className="text-sm text-gray-500 mb-1">Total events</p>
            <p className="text-2xl font-extrabold text-gray-900">{totalEvents}</p>
          </div>
          <div className="create-card p-5">
            <p className="text-sm text-gray-500 mb-1">Tickets sold</p>
            <p className="text-2xl font-extrabold text-gray-900">{totalSold}</p>
          </div>
          <div className="create-card p-5">
            <p className="text-sm text-gray-500 mb-1">Gross collected</p>
            <p className="text-2xl font-extrabold text-gray-900">GHS {totalCollected.toLocaleString()}</p>
          </div>
        </div>
      )}

      {visibleEvents.length === 0 ? (
        <div className="text-center py-24">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dce7fa] ring-1 ring-[#c5d7f5]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#245dbc]" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 mb-1">{filter === 'all' ? 'No events yet' : `No ${filterLabels[filter].toLowerCase()} events`}</p>
          <p className="text-sm text-gray-500 mb-6">{emptyStateCopy[filter]}</p>
          {(filter === 'all' || filter === 'upcoming') && (
            <Link
              href="/dashboard/events/new"
              className="bg-[#3d3d3d] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#2a2a2a] transition-colors inline-flex items-center gap-1.5"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
              Create event
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleEvents.map((event) => (
            <DashboardEventCard
              key={event.id}
              event={event}
              tickets={ticketsByEvent[event.id] ?? []}
              grossCollected={grossCollectedByEvent[event.id] ?? 0}
            />
          ))}
        </div>
      )}
    </>
  )
}
