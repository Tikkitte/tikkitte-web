import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Ticket, UserTicket } from '@/lib/types'

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

async function cancelEvent(eventId: string) {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  await supabase.from('event').update({ cancelled: true }).eq('id', eventId)
  redirect(`/dashboard/events/${eventId}`)
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('event')
    .select('*')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .maybeSingle()

  if (!event) notFound()

  const { data: tickets } = await supabase
    .from('ticket')
    .select('*')
    .eq('event_id', id)
    .order('type')

  const { data: userTickets } = await supabase
    .from('user_ticket')
    .select('*, user_profile(email, name)')
    .eq('event_id', id)

  const ticketMap = (tickets ?? []).reduce((acc: Record<string, Ticket>, t: Ticket) => {
    acc[t.id] = t
    return acc
  }, {})

  const totalRevenue = (tickets ?? []).reduce(
    (s: number, t: Ticket) => s + t.purchased_quantity * t.price, 0
  )
  const totalSold = (tickets ?? []).reduce(
    (s: number, t: Ticket) => s + t.purchased_quantity, 0
  )

  const cancelAction = cancelEvent.bind(null, id)

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <Link href="/dashboard" className="text-sm text-[#1d67ba] hover:underline mb-1 block">
            ← All events
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {formatDate(event.date)} · {event.time?.slice(0, 5)} · {event.venue ?? 'No venue'}
          </p>
          {event.cancelled && (
            <span className="inline-block mt-2 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              Cancelled
            </span>
          )}
        </div>
        {!event.cancelled && (
          <Link
            href={`/dashboard/events/${id}/edit`}
            className="text-sm font-semibold border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shrink-0"
          >
            Edit event
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-2xl font-extrabold text-gray-900">{totalSold}</p>
          <p className="text-sm text-gray-500 mt-0.5">Tickets sold</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-2xl font-extrabold text-gray-900">GHS {totalRevenue.toFixed(0)}</p>
          <p className="text-sm text-gray-500 mt-0.5">Total revenue</p>
        </div>
      </div>

      {/* Ticket breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Ticket breakdown</h2>
        {(tickets ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">No ticket types.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {(tickets ?? []).map((t: Ticket) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900">{t.label}</span>
                  <span className="text-gray-400 ml-2">GHS {t.price}</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-gray-900">
                    {t.purchased_quantity}
                    {t.total_quantity != null ? `/${t.total_quantity}` : ''} sold
                  </span>
                  <span className="text-gray-400 ml-3">
                    GHS {(t.purchased_quantity * t.price).toFixed(0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Attendees */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-semibold text-gray-900 mb-4">Attendees ({(userTickets ?? []).length})</h2>
        {(userTickets ?? []).length === 0 ? (
          <p className="text-sm text-gray-400">No tickets sold yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {(userTickets ?? []).map((ut: UserTicket & { user_profile?: { email: string; name: string } | null }) => (
              <div key={ut.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{ut.user_profile?.name ?? '—'}</p>
                  <p className="text-gray-400">{ut.user_profile?.email ?? '—'}</p>
                </div>
                <div className="text-right text-gray-500">
                  <p>{ticketMap[ut.ticket_type_id]?.label ?? '—'}</p>
                  <p>× {ut.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel */}
      {!event.cancelled && (
        <form action={cancelAction}>
          <button
            type="submit"
            className="text-sm text-red-500 hover:text-red-700 font-medium underline"
          >
            Cancel this event
          </button>
        </form>
      )}
    </div>
  )
}
