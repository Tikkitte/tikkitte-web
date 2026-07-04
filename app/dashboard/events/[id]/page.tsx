import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { ComplimentaryTicket, Event, Ticket, TrackingLink, UserTicket, Payment, Payout } from '@/lib/types'
import { TicketBarChart, RevenueBreakdown } from '@/components/dashboard/LazyTicketChart'
import CancelButton from './CancelButton'
import PublishButton from './PublishButton'
import ShareLiveModal from './ShareLiveModal'
import PromoCodeManager from './PromoCodeManager'
import CompTicketManager from './CompTicketManager'
import TrackingLinkManager from './TrackingLinkManager'
import EventDetailTabs from './EventDetailTabs'
import CheckinStats from '@/components/dashboard/CheckinStats'
import MessageAttendeesButton from './MessageAttendeesButton'
import PayoutSummary from './PayoutSummary'

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return 'TBA'
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function formatTime(timeStr: string | null | undefined) {
  if (!timeStr) return ''
  const [hh, mm] = timeStr.split(':').map(Number)
  const am = hh < 12
  const h12 = ((hh + 11) % 12) + 1
  return `${h12}:${String(mm).padStart(2, '0')} ${am ? 'AM' : 'PM'}`
}

function formatEventDateRange(event: Event) {
  const start = [formatDate(event.date), formatTime(event.time)].filter(Boolean).join(' · ')
  if (!event.end_date) return start
  const end = [formatDate(event.end_date), formatTime(event.end_time)].filter(Boolean).join(' · ')
  return `${start} → ${end}`
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

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ shared?: string }>
}) {
  const { id } = await params
  const { shared } = await searchParams
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

  const [
    { data: tickets },
    { data: userTickets },
    { data: compTickets },
    { data: trackingLinks },
    { data: payments },
    { data: freePayments },
    { data: payouts },
  ] = await Promise.all([
    supabase
      .from('ticket')
      .select('*')
      .eq('event_id', id)
      .order('type'),
    supabase
      .from('user_ticket')
      .select('*')
      .eq('event_id', id),
    supabase
      .from('complimentary_ticket')
      .select('*')
      .eq('event_id', id)
      .order('sent_at', { ascending: false }),
    supabase
      .from('tracking_link')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('payments')
      .select('*')
      .eq('event_id', id)
      .eq('status', 'success')
      .order('paid_at', { ascending: false }),
    supabase
      .from('payments')
      .select('*')
      .eq('event_id', id)
      .eq('status', 'free')
      .order('paid_at', { ascending: false }),
    supabase
      .from('payout')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: false }),
  ])

  const { data: attendeeProfiles } = (userTickets ?? []).length > 0
    ? await supabase.rpc('get_event_attendee_profiles', { p_event_id: id })
    : { data: [] as Array<{ user_id: string; email: string | null; name: string | null }> }

  const profileMap = ((attendeeProfiles ?? []) as Array<{ user_id: string; email: string | null; name: string | null }>).reduce(
    (acc: Record<string, { email: string | null; name: string | null }>, profile) => {
      acc[profile.user_id] = { email: profile.email, name: profile.name }
      return acc
    },
    {}
  )

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
  const grossCollected = allPayments.reduce((s: number, p: Payment) => s + (p.amount ?? 0), 0) / 100
  const configuredPlatformFeePercent = Number(process.env.PLATFORM_FEE_PERCENT ?? '5')
  const platformFeePercent = Number.isFinite(configuredPlatformFeePercent) ? configuredPlatformFeePercent : 5
  const platformFeeAmount = grossCollected * platformFeePercent / 100
  const estimatedPayout = grossCollected - platformFeeAmount
  const collectedByTicketType = allPayments.reduce((acc: Record<string, number>, p: Payment) => {
    if (!p.ticket_type_id) return acc
    acc[p.ticket_type_id] = (acc[p.ticket_type_id] ?? 0) + (p.amount ?? 0) / 100
    return acc
  }, {})
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
  const eventUrl = `https://tikkitte.com/e/${event.slug ?? event.id}`

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
  const paidAttendees = (userTickets ?? [])
    .filter((ut: UserTicket) => !ut.payment_reference?.startsWith('COMP-'))
    .map((ut: UserTicket) => ({
      id: ut.id,
      name: profileMap[ut.user_id]?.name || '—',
      email: profileMap[ut.user_id]?.email || '—',
      ticketLabel: ticketMap[ut.ticket_type_id]?.label ?? '—',
      quantity: ut.quantity,
    }))
  const compAttendees = ((compTickets ?? []) as ComplimentaryTicket[]).map((compTicket) => ({
    id: compTicket.id,
    name: compTicket.recipient_name,
    email: compTicket.recipient_email,
    ticketLabel: ticketMap[compTicket.ticket_type_id]?.label ?? '—',
    quantity: compTicket.quantity,
  }))
  const formattedAttendees = [...paidAttendees, ...compAttendees]

  return (
    <div>
      {shared === '1' && <ShareLiveModal eventUrl={eventUrl} />}

      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          All events
        </Link>
        <div className="flex gap-2">
          {!event.cancelled && (
            <>
              <MessageAttendeesButton
                eventId={id}
                lastAlertSentAt={event.last_alert_sent_at}
                attendeeCount={formattedAttendees.length}
              />
              <PublishButton eventId={id} published={event.published} />
              <Link
                href={`/dashboard/events/${id}/edit`}
                className="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {poster ? (
                <Image
                  src={poster}
                  alt={event.name}
                  width={760}
                  height={960}
                  className="w-full max-h-[480px] object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-[#3d3d3d]/10 to-[#3d3d3d]/5 flex items-center justify-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#3d3d3d]/30">
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                  </svg>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  {!event.published && (
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                      Draft
                    </span>
                  )}
                  {event.cancelled && (
                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                      Cancelled
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">{event.name}</h1>
                <p className="text-sm text-gray-500">
                  {formatEventDateRange(event)}
                </p>
                <p className="text-sm text-gray-500">{event.venue ?? 'No venue'}</p>
                {event.description && (
                  <p className="text-sm text-gray-400 mt-3 leading-relaxed line-clamp-4">{event.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column — scrollable content */}
        <div className="flex-1 min-w-0 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-1">Tickets sold</p>
              <p className="text-xl font-extrabold text-gray-900">
                {totalSold}
                {totalCapacity !== null && <span className="text-gray-400 text-sm font-normal">/{totalCapacity}</span>}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-1">Gross collected</p>
              <p className="text-xl font-extrabold text-gray-900">
                GHS {grossCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              {grossCollected !== totalRevenue && (
                <p className="text-xs text-gray-400 mt-1">Face value: GHS {totalRevenue.toLocaleString()}</p>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-1">Transactions</p>
              <p className="text-xl font-extrabold text-gray-900">{allPayments.length}</p>
            </div>
          </div>

          {/* Check-in stats (live via Realtime) */}
          <CheckinStats
            eventId={id}
            totalSold={totalSold}
            initialCheckedIn={totalCheckedIn}
            scannerPin={event.scanner_pin ?? null}
          />

          <PayoutSummary
            grossCollected={grossCollected}
            platformFeePercent={platformFeePercent}
            platformFeeAmount={platformFeeAmount}
            estimatedPayout={estimatedPayout}
            payouts={(payouts ?? []) as Payout[]}
          />

          {/* Charts */}
          {(tickets ?? []).length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-4 text-sm">Sales by ticket type</h2>
                <TicketBarChart data={chartData} />
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-semibold text-gray-900 mb-4 text-sm">Revenue breakdown</h2>
                <RevenueBreakdown data={chartData} />
              </div>
            </div>
          )}

          {/* Ticket breakdown table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-4 text-sm">Ticket types</h2>
            {(tickets ?? []).length === 0 ? (
              <p className="text-sm text-gray-400">No ticket types.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 pr-4 font-medium text-gray-500">Type</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Sold</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500">Revenue</th>
                      <th className="text-right py-3 pl-4 font-medium text-gray-500">Collected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tickets ?? []).map((t: Ticket) => (
                      <tr key={t.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 pr-4 font-medium text-gray-900">{t.label}</td>
                        <td className="py-3 px-4 text-right text-gray-600">GHS {t.price}</td>
                        <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                          {t.purchased_quantity}
                          {t.total_quantity != null && <span className="text-gray-400 font-normal">/{t.total_quantity}</span>}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                          GHS {(t.purchased_quantity * t.price).toLocaleString()}
                        </td>
                        <td className="py-3 pl-4 text-right text-gray-900 font-semibold">
                          GHS {(collectedByTicketType[t.id] ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <PromoCodeManager eventId={id} tickets={(tickets ?? []) as Ticket[]} />

          <CompTicketManager
            eventId={id}
            tickets={(tickets ?? []) as Ticket[]}
            initialCompTickets={(compTickets ?? []) as ComplimentaryTicket[]}
          />

          <TrackingLinkManager
            eventId={id}
            eventSlug={event.slug ?? event.id}
            initialTrackingLinks={(trackingLinks ?? []) as TrackingLink[]}
          />

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
