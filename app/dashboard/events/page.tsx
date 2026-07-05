import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Event, Ticket } from '@/lib/types'
import DashboardEventsClient from '@/components/dashboard/DashboardEventsClient'

type EventFilter = 'all' | 'upcoming' | 'past' | 'drafts'

function parseFilter(value: string | undefined): EventFilter {
  return value === 'all' || value === 'past' || value === 'drafts' ? value : 'upcoming'
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawEvents } = await supabase
    .from('event')
    .select('*')
    .eq('organizer_id', user.id)

  const events = (rawEvents ?? []) as Event[]
  const eventIds = events.map((event) => event.id)

  const { data: rawTickets } = eventIds.length
    ? await supabase.from('ticket').select('*').in('event_id', eventIds)
    : { data: [] }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your events</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your events and track sales</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#3d3d3d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
          Create event
        </Link>
      </div>

      <DashboardEventsClient
        events={events}
        tickets={(rawTickets ?? []) as Ticket[]}
        initialFilter={parseFilter(filter)}
      />
    </div>
  )
}
