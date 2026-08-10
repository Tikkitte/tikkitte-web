import { createClient, getAuthedUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { ComplimentaryTicket, Event, Ticket, TrackingLink, UserTicket, Payment, Payout, TablePackage } from '@/lib/types'
import { TicketBarChart, RevenueBreakdown } from '@/components/dashboard/LazyTicketChart'
import ShareLiveModal from './ShareLiveModal'
import PromoCodeManager from './PromoCodeManager'
import CompTicketManager from './CompTicketManager'
import TrackingLinkManager from './TrackingLinkManager'
import EventDetailTabs from './EventDetailTabs'
import CheckinStats from '@/components/dashboard/CheckinStats'
import MessageAttendeesButton from './MessageAttendeesButton'
import PayoutSummary from './PayoutSummary'
import TablePackageManager from './TablePackageManager'
import EventWorkspace from './EventWorkspace'

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

function paymentRevenueAllocations(payment: Payment) {
  const rawLines = payment.metadata && Array.isArray(payment.metadata.tickets)
    ? payment.metadata.tickets
    : []
  const lines = rawLines.flatMap((line) => {
    if (!line || typeof line !== 'object') return []
    const ticketTypeId = 'ticket_type_id' in line && typeof line.ticket_type_id === 'string'
      ? line.ticket_type_id
      : null
    const quantity = 'quantity' in line ? Number(line.quantity) : Number.NaN
    const unitPrice = 'unit_price' in line ? Number(line.unit_price) : Number.NaN
    if (!ticketTypeId || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) return []
    return [{ ticketTypeId, weight: quantity * unitPrice }]
  })
  const totalWeight = lines.reduce((sum, line) => sum + line.weight, 0)
  const collected = Number(payment.amount ?? 0) / 100

  if (lines.length > 0 && totalWeight > 0) {
    return lines.map((line) => ({
      ticketTypeId: line.ticketTypeId,
      amount: collected * line.weight / totalWeight,
    }))
  }

  return payment.ticket_type_id
    ? [{ ticketTypeId: payment.ticket_type_id, amount: collected }]
    : []
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
  const user = await getAuthedUser()
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
    { data: attendeeProfiles },
    { data: tablePackages },
    { count: activePromoCount },
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
    supabase.rpc('get_event_attendee_profiles', { p_event_id: id }),
    event.floor_plan_venue === 'aria'
      ? supabase
          .from('table_package')
          .select('id, event_id, ticket_type_id, table_code, table_kind, tier_name, guest_capacity, min_spend, deposit, bottles, enabled, reservation_status, created_at, updated_at')
          .eq('event_id', id)
          .order('table_code')
      : Promise.resolve({ data: [] }),
    supabase
      .from('promo_code')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', id)
      .eq('active', true),
  ])

  const allTickets = (tickets ?? []) as Ticket[]
  const ordinaryTickets = allTickets.filter((ticket) => !ticket.is_table_ticket)
  const tableTickets = allTickets.filter((ticket) => ticket.is_table_ticket)

  const profileMap = ((attendeeProfiles ?? []) as Array<{ user_id: string; email: string | null; name: string | null }>).reduce(
    (acc: Record<string, { email: string | null; name: string | null }>, profile) => {
      acc[profile.user_id] = { email: profile.email, name: profile.name }
      return acc
    },
    {}
  )

  const allPayments = [...(payments ?? []), ...(freePayments ?? [])].sort((a, b) => {
      const da = a.paid_at ? new Date(a.paid_at).getTime() : 0
      const db = b.paid_at ? new Date(b.paid_at).getTime() : 0
      return db - da
    })
  const eligiblePayments = allPayments.filter((payment) => payment.refund_status !== 'success')

  const ticketMap = (tickets ?? []).reduce((acc: Record<string, Ticket>, t: Ticket) => {
    acc[t.id] = t
    return acc
  }, {})

  const grossCollected = eligiblePayments.reduce((s: number, p: Payment) => s + (p.amount ?? 0), 0) / 100
  const configuredPlatformFeePercent = Number(process.env.PLATFORM_FEE_PERCENT ?? '5')
  const platformFeePercent = Number.isFinite(configuredPlatformFeePercent) ? configuredPlatformFeePercent : 5
  const platformFeeAmount = grossCollected * platformFeePercent / 100
  const estimatedPayout = grossCollected - platformFeeAmount
  const collectedByTicketType = eligiblePayments.reduce((acc: Record<string, number>, payment: Payment) => {
    for (const allocation of paymentRevenueAllocations(payment)) {
      acc[allocation.ticketTypeId] = (acc[allocation.ticketTypeId] ?? 0) + allocation.amount
    }
    return acc
  }, {})
  const totalSold = ordinaryTickets.reduce(
    (s: number, t: Ticket) => s + t.purchased_quantity, 0
  )
  const totalCheckedIn = (userTickets ?? [])
    .filter((ut: UserTicket) => ut.used)
    .reduce((sum: number, ut: UserTicket) => sum + Number(ut.quantity ?? 0), 0)
  const bookedTableGuests = ((tablePackages ?? []) as TablePackage[])
    .filter((table) => table.reservation_status === 'booked')
    .reduce((sum, table) => sum + Number(table.guest_capacity), 0)
  const totalAdmissionsIssued = totalSold + bookedTableGuests
  const totalCapacity = ordinaryTickets.some((t: Ticket) => t.total_quantity === null)
    ? null
    : ordinaryTickets.reduce((s: number, t: Ticket) => s + (t.total_quantity ?? 0), 0)

  const collectedTableRevenue = tableTickets.reduce((sum, ticket) => sum + (collectedByTicketType[ticket.id] ?? 0), 0)

  const chartData = [
    ...ordinaryTickets.map((t: Ticket) => ({
      label: t.label,
      sold: t.purchased_quantity,
      remaining: t.total_quantity !== null ? t.total_quantity - t.purchased_quantity : null,
      revenue: collectedByTicketType[t.id] ?? 0,
      price: t.price,
    })),
    // Table Reservations: "sold" is total guests admitted across booked tables
    // (not table count), so this reads consistently with ordinary ticket bars —
    // every bar answers "how many people came in through this ticket type."
    ...((tablePackages ?? []).length > 0
      ? [{
          label: 'Table Reservations',
          sold: bookedTableGuests,
          remaining: null,
          revenue: collectedTableRevenue,
          price: 0,
        }]
      : []),
  ]

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
      status: p.refund_status === 'success' ? 'refunded' : p.status,
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

  const ticketTable = (
    <div className="create-card overflow-hidden">
      <div className="px-5 py-4 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">Sales by ticket type</div>
      {ordinaryTickets.length === 0 ? <p className="px-5 pb-8 text-sm text-[var(--tikkitte-ink-faint)]">No ticket types.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead><tr className="border-y border-[var(--tikkitte-cream-border)] text-[10.5px] uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]"><th className="px-5 py-3 text-left">Ticket</th><th className="px-4 py-3 text-right">Price</th><th className="px-4 py-3 text-right">Sold</th><th className="px-5 py-3 text-right">Gross</th></tr></thead>
            <tbody>
              {ordinaryTickets.map((ticket, index) => <tr key={ticket.id} className={`border-b border-[var(--tikkitte-cream-border)] ${index % 2 ? 'bg-[#faf9f5]' : ''}`}><td className="px-5 py-3 font-semibold">{ticket.label}{ticket.total_quantity !== null && ticket.purchased_quantity >= ticket.total_quantity && <span className="ml-2 rounded-full bg-[#d9e4fa] px-2 py-1 text-[10px] font-bold uppercase text-[#2565d0]">Sold out</span>}</td><td className="px-4 py-3 text-right text-[var(--tikkitte-ink-soft)]">GHS {ticket.price.toLocaleString()}</td><td className="px-4 py-3 text-right">{ticket.purchased_quantity}{ticket.total_quantity !== null ? `/${ticket.total_quantity}` : ''}</td><td className="px-5 py-3 text-right font-semibold">GHS {(collectedByTicketType[ticket.id] ?? 0).toLocaleString()}</td></tr>)}
              <tr className="border-t-2 border-[var(--tikkitte-ink)] bg-[var(--tikkitte-cream)] font-bold"><td className="px-5 py-4">Total</td><td /><td className="px-4 py-4 text-right">{totalSold}{totalCapacity !== null ? `/${totalCapacity}` : ''}</td><td className="create-display px-5 py-4 text-right">GHS {grossCollected.toLocaleString()}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  const payoutPanel = <PayoutSummary grossCollected={grossCollected} platformFeePercent={platformFeePercent} platformFeeAmount={platformFeeAmount} estimatedPayout={estimatedPayout} payouts={(payouts ?? []) as Payout[]} />

  return (
    <div>
      {shared === '1' && <ShareLiveModal eventUrl={eventUrl} />}
      <Link href="/dashboard/events" className="create-focus mb-5 inline-flex min-h-11 items-center text-sm font-medium text-[var(--tikkitte-ink-soft)] hover:text-[var(--tikkitte-ink)]">← All events</Link>

      <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-[108px] w-[86px] shrink-0 overflow-hidden rounded-xl bg-[#30303b]">
          {poster ? <Image src={poster} alt={event.name} width={172} height={216} className="h-full w-full object-cover" priority /> : <div className="create-display flex h-full items-center justify-center text-xl text-white">{event.name.split(/\s+/).slice(0, 3).map((part: string) => part[0]).join('').toUpperCase()}</div>}
        </div>
        <div className="min-w-0 flex-1">
          <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-[var(--tikkitte-cream-border)] bg-white px-3 py-1.5 text-xs font-semibold"><span className={`h-1.5 w-1.5 rounded-full ${event.cancelled ? 'bg-red-500' : event.published ? 'bg-[#2e6fe6]' : 'bg-amber-500'}`} />{event.cancelled ? 'Cancelled' : event.published ? 'On sale' : 'Draft'}</span>
          <h1 className="create-display truncate text-[30px]">{event.name}</h1>
          <div className="mt-1 flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2565d0]">{formatEventDateRange(event)} · {event.venue ?? 'Venue TBA'}</p>
            <a href={eventUrl} className="create-focus truncate text-xs text-[var(--tikkitte-ink-faint)]" target="_blank" rel="noreferrer">{eventUrl.replace('https://', '')} ↗</a>
          </div>
          {!event.cancelled && <Link href={`/dashboard/events/${id}/edit`} className="create-focus mt-3 inline-flex min-h-10 items-center rounded-full border border-[var(--tikkitte-cream-border)] px-5 text-sm font-semibold hover:border-[var(--tikkitte-ink)]">Edit event</Link>}
        </div>
      </header>

      <EventWorkspace
        hasTables={event.floor_plan_venue === 'aria'}
        counts={{ tables: (tablePackages ?? []).length, marketing: (activePromoCount ?? 0) + (trackingLinks ?? []).length + (compTickets ?? []).length, attendees: totalAdmissionsIssued }}
        panels={{
          overview: <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[
              ['Tickets sold', `${totalSold}${totalCapacity !== null ? `/${totalCapacity}` : ''}`],
              ['Gross collected', `GHS ${grossCollected.toLocaleString()}`],
              ['Transactions', allPayments.length.toLocaleString()],
              ['Checked in', `${totalCheckedIn}/${totalAdmissionsIssued}`],
            ].map(([label, value]) => <div key={label} className="create-card p-4"><p className="text-xs text-[var(--tikkitte-ink-faint)]">{label}</p><p className="create-display mt-1 text-[26px]">{value}</p></div>)}</div>
            <CheckinStats eventId={id} totalSold={totalAdmissionsIssued} initialCheckedIn={totalCheckedIn} scannerPin={event.scanner_pin ?? null} doorsAt={formatTime(event.time)} />
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
              {ticketTable}
              <div className="space-y-4">{payoutPanel}<div className="create-card overflow-hidden"><div className="border-b border-[var(--tikkitte-cream-border)] px-5 py-4 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">Marketing</div>{[['Message attendees', paidAttendees.length], ['Promo codes', `${activePromoCount ?? 0} active`], ['Tracking links', (trackingLinks ?? []).length], ['Comp tickets', `${(compTickets ?? []).reduce((sum, ticket) => sum + ticket.quantity, 0)} issued`]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-[var(--tikkitte-cream-border)] px-5 py-3 text-sm last:border-0"><span>{label}</span><span className="text-[var(--tikkitte-ink-faint)]">{value} ›</span></div>)}</div></div>
            </div>
          </div>,
          tickets: <div className="space-y-5">
            {ordinaryTickets.length > 0 && <section className="grid gap-5 xl:grid-cols-2" aria-label="Sales analytics">
              <div className="create-card flex min-h-0 flex-col overflow-hidden">
                <header className="border-b border-[var(--tikkitte-cream-border)] px-5 py-4 sm:px-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2565d0]">Ticket performance</p>
                  <h2 className="create-display mt-1 text-[22px]">Sales by ticket type</h2>
                  <p className="mt-1 text-xs text-[var(--tikkitte-ink-faint)]">Admissions issued across each ticket type.</p>
                </header>
                <div className="min-h-80 flex-1 p-4 sm:p-6"><TicketBarChart data={chartData} /></div>
              </div>
              <div className="create-card overflow-hidden">
                <header className="border-b border-[var(--tikkitte-cream-border)] px-5 py-4 sm:px-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2565d0]">Revenue mix</p>
                  <h2 className="create-display mt-1 text-[22px]">Revenue breakdown</h2>
                  <p className="mt-1 text-xs text-[var(--tikkitte-ink-faint)]">Share of non-refunded collections by ticket type.</p>
                </header>
                <div className="p-5 sm:p-6"><RevenueBreakdown data={chartData} /></div>
              </div>
            </section>}
            <EventDetailTabs payments={formattedPayments} attendees={formattedAttendees} fixedTab="transactions" />
          </div>,
          tables: event.floor_plan_venue === 'aria' ? <TablePackageManager eventId={id} initialPackages={(tablePackages ?? []) as TablePackage[]} initialLive={event.aria_tables_live} /> : null,
          payout: payoutPanel,
          marketing: <div className="space-y-5"><div className="create-card p-5"><h2 className="create-display text-xl">Reach your audience</h2><p className="mb-4 mt-1 text-sm text-[var(--tikkitte-ink-soft)]">Message ticket holders or create campaign tools for this event.</p><MessageAttendeesButton eventId={id} lastAlertSentAt={event.last_alert_sent_at} attendeeCount={paidAttendees.length} /></div><PromoCodeManager eventId={id} tickets={ordinaryTickets} /><TrackingLinkManager eventId={id} eventSlug={event.slug ?? event.id} initialTrackingLinks={(trackingLinks ?? []) as TrackingLink[]} /><CompTicketManager eventId={id} tickets={ordinaryTickets} initialCompTickets={(compTickets ?? []) as ComplimentaryTicket[]} /></div>,
          attendees: <EventDetailTabs payments={formattedPayments} attendees={formattedAttendees} fixedTab="attendees" />,
        }}
      />
    </div>
  )
}
