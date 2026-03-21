import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Event, Ticket } from '@/lib/types'

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function eventStatus(event: Event): { label: string; color: string } {
  if (event.cancelled) return { label: 'Cancelled', color: 'text-red-600 bg-red-50' }
  const today = new Date().toISOString().slice(0, 10)
  if (event.date < today) return { label: 'Past', color: 'text-gray-500 bg-gray-100' }
  return { label: 'Upcoming', color: 'text-green-700 bg-green-50' }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: events } = await supabase
    .from('event')
    .select('*')
    .eq('organizer_id', user.id)
    .order('date', { ascending: false })

  const eventIds = (events ?? []).map((e: Event) => e.id)

  const { data: tickets } = eventIds.length
    ? await supabase.from('ticket').select('*').in('event_id', eventIds)
    : { data: [] }

  const ticketsByEvent = (tickets ?? []).reduce((acc: Record<string, Ticket[]>, t: Ticket) => {
    if (!acc[t.event_id]) acc[t.event_id] = []
    acc[t.event_id].push(t)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your events</h1>
        <Link
          href="/dashboard/events/new"
          className="bg-[#1d67ba] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1555a0] transition-colors"
        >
          + Create event
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <div className="text-center py-24 text-gray-400">
          <div className="text-5xl mb-4">🎭</div>
          <p className="font-medium text-gray-600 mb-2">No events yet</p>
          <p className="text-sm mb-6">Create your first event to start selling tickets.</p>
          <Link
            href="/dashboard/events/new"
            className="bg-[#1d67ba] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#1555a0] transition-colors"
          >
            Create event
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {events.map((event: Event) => {
            const tix = ticketsByEvent[event.id] ?? []
            const sold = tix.reduce((s: number, t: Ticket) => s + t.purchased_quantity, 0)
            const capacity = tix.some((t: Ticket) => t.total_quantity === null)
              ? null
              : tix.reduce((s: number, t: Ticket) => s + (t.total_quantity ?? 0), 0)
            const revenue = tix.reduce((s: number, t: Ticket) => s + t.purchased_quantity * t.price, 0)
            const status = eventStatus(event)

            return (
              <Link
                key={event.id}
                href={`/dashboard/events/${event.id}`}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{event.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(event.date)} · {event.venue ?? 'No venue'}</p>
                </div>
                <div className="flex gap-6 text-sm shrink-0">
                  <div className="text-center">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {sold}{capacity !== null ? `/${capacity}` : ''}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">Tickets sold</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 dark:text-white">GHS {revenue.toFixed(0)}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">Revenue</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
