import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Event, Ticket } from '@/lib/types'
import DashboardEventsClient from '@/components/dashboard/DashboardEventsClient'

type EventFilter = 'all' | 'upcoming' | 'past' | 'drafts'

function parseFilter(value: string | undefined): EventFilter {
  return value === 'all' || value === 'past' || value === 'drafts' ? value : 'upcoming'
}

export default async function DashboardPage({
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your events</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your events and track sales</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="bg-[#1d67ba] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1555a0] transition-colors inline-flex items-center gap-1.5"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
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
