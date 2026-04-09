import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Ticket, UserTicket, Payment } from '@/lib/types'
import { TicketBarChart, RevenueBreakdown } from '@/components/dashboard/TicketChart'
import CancelButton from './CancelButton'
import EventDetailTabs from './EventDetailTabs'
import CheckinStats from '@/components/dashboard/CheckinStats'

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
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

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('event_id', id)
    .eq('status', 'success')
    .order('paid_at', { ascending: false })

  const { data: freePayments } = await supabase
    .from('payments')
    .select('*')
    .eq('event_id', id)
    .eq('status', 'free')
    .order('paid_at', { ascending: false })

  const allPayments = [...(payments ?? []), ...(freePayments ?? [])]
    .sort((a, b) => {
      const da = a.paid_at ? new Date(a.paid_at).getTime() : 0
      const db = b.paid_at ? new Date(b.paid_at).getTime() : 0
      return db - da
    })

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
  const totalCheckedIn = (userTickets ?? []).filter((ut: UserTicket) => ut.used).length
  const totalCapacity = (tickets ?? []).some((t: Ticket) => t.total_quantity === null)
    ? null
    : (tickets ?? []).reduce((s: number, t: Ticket) => s + (t.total_quantity ?? 0), 0)

  const chartData = (tickets ?? []).map((t: Ticket) => ({
    label: t.label,
    sold: t.purchased_quantity,
    remaining: t.total_quantity !== null ? t.total_quantity - t.purchased_quantity : null,
    revenue: t.purchased_quantity * t.price,
    price: t.price,
  }))

  const poster = event.image?.[0]

  // Group user_tickets by payment_reference to build accurate ticket summaries
  const ticketsByRef = (userTickets ?? []).reduce((acc: Record<string, Array<{ label: string; quantity: number }>>, ut: UserTicket) => {
    if (!ut.payment_reference) return acc
    if (!acc[ut.payment_reference]) acc[ut.payment_reference] = []
    acc[ut.payment_reference].push({
      label: ticketMap[ut.ticket_type_id]?.label ?? '—',
      quantity: ut.quantity,
    })
    return acc
  }, {})

  // Format payments for the tabs component
  const formattedPayments = allPayments.map((p: Payment) => {
    const items = ticketsByRef[p.reference] ?? []
    const ticketLabel = items.length > 0
      ? items.map((i: { label: string; quantity: number }) => `${i.label} × ${i.quantity}`).join(', ')
      : ticketMap[p.ticket_type_id]?.label ?? '—'
    const quantity = items.length > 0
      ? items.reduce((s: number, i: { label: string; quantity: number }) => s + i.quantity, 0)
      : p.quantity
    return {
      reference: p.reference,
      amount: p.amount,
      status: p.status,
      paidAt: p.paid_at ? formatDateTime(p.paid_at) : '—',
      ticketLabel,
      quantity,
    }
  })

  // Format attendees for the tabs component
  const formattedAttendees = (userTickets ?? []).map((ut: UserTicket & { user_profile?: { email: string; name: string } | null }) => ({
    id: ut.id,
    name: ut.user_profile?.name ?? '—',
    email: ut.user_profile?.email ?? '—',
    ticketLabel: ticketMap[ut.ticket_type_id]?.label ?? '—',
    quantity: ut.quantity,
  }))

  return (
    <div>
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          All events
        </Link>
        <div className="flex gap-2">
          {!event.cancelled && (
            <>
              <Link
                href={`/dashboard/events/${id}/edit`}
                className="bg-gray-900 dark:bg-white text-white dark:text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
              >
                Edit event
              </Link>
              <CancelButton eventId={id} />
            </>
          )}
        </div>
      </div>

      {/* Two-column layout: poster left, content right */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left column — sticky poster */}
        <div className="lg:w-[380px] lg:flex-shrink-0">
          <div className="lg:sticky lg:top-20">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 overflow-hidden">
              {poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={poster} alt={event.name} className="w-full max-h-[480px] object-cover" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-[#1d67ba]/10 to-[#1d67ba]/5 dark:from-[#1d67ba]/20 dark:to-[#1d67ba]/5 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#1d67ba]/30">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                  </svg>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {event.cancelled && (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400 px-2.5 py-1 rounded-full">
                      Cancelled
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{event.name}</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {formatDate(event.date)} · {event.time?.slice(0, 5)}
                </p>
                <p className="text-sm text-gray-500 dark:text-slate-400">{event.venue ?? 'No venue'}</p>
                {event.description && (
                  <p className="text-sm text-gray-400 dark:text-slate-500 mt-3 leading-relaxed line-clamp-4">{event.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column — scrollable content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 p-4">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Tickets sold</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">
                {totalSold}
                {totalCapacity !== null && <span className="text-gray-400 dark:text-slate-500 text-sm font-normal">/{totalCapacity}</span>}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 p-4">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Revenue</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">GHS {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 p-4">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Transactions</p>
              <p className="text-xl font-extrabold text-gray-900 dark:text-white">{allPayments.length}</p>
            </div>
          </div>

          {/* Check-in stats (live via Realtime) */}
          <CheckinStats
            eventId={id}
            totalSold={totalSold}
            initialCheckedIn={totalCheckedIn}
            scannerPin={event.scanner_pin ?? null}
          />

          {/* Charts */}
          {(tickets ?? []).length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 p-5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Sales by ticket type</h2>
                <TicketBarChart data={chartData} />
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 p-5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Revenue breakdown</h2>
                <RevenueBreakdown data={chartData} />
              </div>
            </div>
          )}

          {/* Ticket breakdown table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-slate-950/20 p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm">Ticket types</h2>
            {(tickets ?? []).length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500">No ticket types.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800">
                      <th className="text-left py-3 pr-4 font-medium text-gray-500 dark:text-slate-400">Type</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-slate-400">Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-slate-400">Sold</th>
                      <th className="text-right py-3 pl-4 font-medium text-gray-500 dark:text-slate-400">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tickets ?? []).map((t: Ticket) => (
                      <tr key={t.id} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                        <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{t.label}</td>
                        <td className="py-3 px-4 text-right text-gray-600 dark:text-slate-300">GHS {t.price}</td>
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-semibold">
                          {t.purchased_quantity}
                          {t.total_quantity != null && <span className="text-gray-400 dark:text-slate-500 font-normal">/{t.total_quantity}</span>}
                        </td>
                        <td className="py-3 pl-4 text-right text-gray-900 dark:text-white font-semibold">
                          GHS {(t.purchased_quantity * t.price).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tabbed section: Transactions & Attendees */}
          <EventDetailTabs
            payments={formattedPayments}
            attendees={formattedAttendees}
          />
        </div>
      </div>
    </div>
  )
}
