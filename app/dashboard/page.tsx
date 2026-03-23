import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Event, Ticket } from '@/lib/types'

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function eventStatus(event: Event): { label: string; color: string; dot: string } {
  if (event.cancelled) return { label: 'Cancelled', color: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400', dot: 'bg-red-500' }
  const today = new Date().toISOString().slice(0, 10)
  if (event.date < today) return { label: 'Past', color: 'text-gray-500 bg-gray-100 dark:bg-slate-800 dark:text-slate-400', dot: 'bg-gray-400' }
  return { label: 'Upcoming', color: 'text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-400', dot: 'bg-green-500' }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawEvents } = await supabase
    .from('event')
    .select('*')
    .eq('organizer_id', user.id)

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = (rawEvents ?? []).filter((e: Event) => e.date >= today && !e.cancelled).sort((a: Event, b: Event) => a.date.localeCompare(b.date))
  const past = (rawEvents ?? []).filter((e: Event) => e.date < today || e.cancelled).sort((a: Event, b: Event) => b.date.localeCompare(a.date))
  const events = [...upcoming, ...past]

  const eventIds = (events ?? []).map((e: Event) => e.id)

  const { data: tickets } = eventIds.length
    ? await supabase.from('ticket').select('*').in('event_id', eventIds)
    : { data: [] }

  const ticketsByEvent = (tickets ?? []).reduce((acc: Record<string, Ticket[]>, t: Ticket) => {
    if (!acc[t.event_id]) acc[t.event_id] = []
    acc[t.event_id].push(t)
    return acc
  }, {})

  // Aggregate stats
  const totalEvents = (events ?? []).length
  const totalSold = (tickets ?? []).reduce((s: number, t: Ticket) => s + t.purchased_quantity, 0)
  const totalRevenue = (tickets ?? []).reduce((s: number, t: Ticket) => s + t.purchased_quantity * t.price, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Your events</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage your events and track sales</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="bg-[#1d67ba] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1555a0] transition-colors inline-flex items-center gap-1.5"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
          Create event
        </Link>
      </div>

      {/* Summary cards */}
      {totalEvents > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 p-5">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Total events</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{totalEvents}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 p-5">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Tickets sold</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{totalSold}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 p-5">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Total revenue</p>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">GHS {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Event list */}
      {!events || events.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 dark:text-slate-300 mb-1">No events yet</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Create your first event to start selling tickets.</p>
          <Link
            href="/dashboard/events/new"
            className="bg-[#1d67ba] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#1555a0] transition-colors inline-flex items-center gap-1.5"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10" /></svg>
            Create event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event: Event) => {
            const tix = ticketsByEvent[event.id] ?? []
            const sold = tix.reduce((s: number, t: Ticket) => s + t.purchased_quantity, 0)
            const capacity = tix.some((t: Ticket) => t.total_quantity === null)
              ? null
              : tix.reduce((s: number, t: Ticket) => s + (t.total_quantity ?? 0), 0)
            const revenue = tix.reduce((s: number, t: Ticket) => s + t.purchased_quantity * t.price, 0)
            const status = eventStatus(event)
            const poster = event.image?.[0]

            return (
              <div
                key={event.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 overflow-hidden flex flex-col hover:shadow-lg transition-shadow"
              >
                {/* Event poster */}
                <div className="relative h-44 bg-gray-100 dark:bg-slate-800">
                  {poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={poster} alt={event.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-slate-600">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                      </svg>
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${status.color} backdrop-blur-sm`}>
                    {status.label}
                  </span>
                </div>

                {/* Event info */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1 line-clamp-1">{event.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{formatDate(event.date)} · {event.venue ?? 'No venue'}</p>

                  {/* Stats row */}
                  <div className="flex gap-4 mb-4 mt-auto">
                    <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                        {sold}{capacity !== null ? <span className="text-gray-400 dark:text-slate-500 text-sm font-normal">/{capacity}</span> : ''}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Sold</p>
                    </div>
                    <div className="flex-1 bg-gray-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 text-center">
                      <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">GHS {revenue.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">Revenue</p>
                    </div>
                  </div>

                  {/* Action button */}
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold py-2.5 rounded-lg text-center hover:bg-gray-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    View details
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
