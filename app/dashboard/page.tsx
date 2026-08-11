import { createClient, getAuthedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Event, Ticket, Payout, PayoutAccount } from '@/lib/types'
import DashboardRevenueChart from '@/components/dashboard/LazyDashboardRevenueChart'
import RequestPayoutButton from '@/components/dashboard/RequestPayoutButton'
import { resolvePlatformFeePercent } from '@/lib/platformFee'

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return 'TBA'
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function formatMoney(value: number, decimals = 0) {
  return `GHS ${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

function initials(value: string) {
  return value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'TK'
}

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: rawEvents }, { data: primaryAccount }, { data: rawPayouts }] = await Promise.all([
    supabase
      .from('organizer_profile')
      .select('display_name, platform_fee_percent')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('event')
      .select('*')
      .eq('organizer_id', user.id),
    supabase
      .from('payout_account')
      .select('*')
      .eq('organizer_id', user.id)
      .eq('is_primary', true)
      .maybeSingle(),
    supabase
      .from('payout')
      .select('amount, status')
      .eq('organizer_id', user.id)
      .in('status', ['pending', 'paid']),
  ])

  const events = (rawEvents ?? []) as Event[]
  const eventIds = events.map((e) => e.id)

  const [{ data: rawTickets }, { data: rawPayments }] = eventIds.length
    ? await Promise.all([
        supabase.from('ticket').select('*').in('event_id', eventIds).eq('is_table_ticket', false),
        supabase
          .from('payments')
          .select('amount, paid_at, refund_status')
          .in('event_id', eventIds)
          .in('status', ['success', 'free']),
      ])
    : [{ data: [] }, { data: [] }]

  const tickets = (rawTickets ?? []) as Ticket[]
  const payments = ((rawPayments ?? []) as { amount: number | null; paid_at: string | null; refund_status: string | null }[])
    .filter((payment) => payment.refund_status !== 'success')
  const payouts = (rawPayouts ?? []) as Pick<Payout, 'amount' | 'status'>[]
  const account = primaryAccount as PayoutAccount | null

  const ticketsByEvent = tickets.reduce((acc: Record<string, Ticket[]>, t) => {
    if (!acc[t.event_id]) acc[t.event_id] = []
    acc[t.event_id].push(t)
    return acc
  }, {})

  const PLATFORM_FEE_PCT = resolvePlatformFeePercent((profile as { platform_fee_percent: number | null } | null)?.platform_fee_percent) / 100

  const totalEvents = events.length
  const totalTicketsSold = tickets.reduce((sum, t) => sum + t.purchased_quantity, 0)
  const totalRevenue = tickets.reduce((sum, t) => sum + t.purchased_quantity * t.price, 0)
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount ?? 0) / 100, 0)
  const platformFee = totalCollected * PLATFORM_FEE_PCT
  const totalRequestedOrPaid = payouts.reduce((sum, payout) => sum + Number(payout.amount), 0)
  const netAvailable = totalCollected - platformFee - totalRequestedOrPaid
  const displayAvailable = Math.max(0, netAvailable)
  const feeOnAvailable = displayAvailable * PLATFORM_FEE_PCT
  const avgTicketValue = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0

  const today = new Date().toISOString().slice(0, 10)
  const upcomingEvents = events
    .filter((e) => e.published && !e.cancelled && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4)

  const displayName = profile?.display_name ?? user.email ?? 'there'
  const feePct = (PLATFORM_FEE_PCT * 100).toFixed(0)

  const collectedLastSevenDays = payments.reduce((sum, payment) => {
    if (!payment.paid_at || new Date(payment.paid_at).getTime() < new Date().getTime() - 7 * 86_400_000) return sum
    return sum + (payment.amount ?? 0) / 100
  }, 0)

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#2565d0]">Organizer dashboard</p>
          <h1 className="create-display text-[34px]">Welcome back, {displayName}</h1>
          <p className="mt-1 text-[13px] text-[var(--tikkitte-ink-soft)]">{formatMoney(collectedLastSevenDays)} collected in the last 7 days.</p>
        </div>
        <Link href="/dashboard/events/new" className="create-focus inline-flex min-h-12 items-center justify-center rounded-full bg-[#2e6fe6] px-7 text-sm font-bold text-white transition-colors hover:bg-[#2565d0]">+ Create event</Link>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Organizer totals">
        {[
          ['Total events', totalEvents.toLocaleString()],
          ['Tickets sold', totalTicketsSold.toLocaleString()],
          ['Gross collected', formatMoney(totalCollected)],
          ['Avg ticket value', formatMoney(avgTicketValue, 2)],
        ].map(([label, value]) => (
          <div key={label} className="create-card p-4 sm:p-5">
            <p className="text-[13px] text-[var(--tikkitte-ink-faint)]">{label}</p>
            <p className="create-display mt-1 break-words text-[clamp(24px,3vw,30px)]">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_316px]">
        <div className="create-card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">Revenue</h2>
            <Link href="/dashboard/transactions" className="create-focus text-xs font-semibold text-[#2565d0]">All transactions →</Link>
          </div>
          <DashboardRevenueChart payments={payments} />
        </div>

        <div className="flex min-h-[300px] flex-col rounded-[18px] bg-[#191917] p-6 text-white">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#a7a59a]">Available balance</p>
          <p className="create-display mt-3 text-[32px] text-white">{formatMoney(displayAvailable, 2)}</p>
          <p className="mt-1 text-xs text-[#a7a59a]">After {feePct}% platform fee ({formatMoney(feeOnAvailable, 2)})</p>
          {account ? (
            <div className="my-5 rounded-full bg-white/[0.07] px-4 py-3 text-xs text-[#d8d6cc]">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#2e6fe6]" />
              {account.provider} ···{account.account_number.slice(-4)} connected
            </div>
          ) : (
            <Link href="/dashboard/settings" className="create-focus my-5 rounded-xl border border-dashed border-white/20 px-4 py-3 text-center text-xs text-[#d8d6cc]">Add a payout account in Settings →</Link>
          )}
          <div className="mt-auto">
            <RequestPayoutButton availableBalance={displayAvailable} hasPayoutAccount={Boolean(account)} />
            <p className="mt-3 text-center text-[11px] text-[#8a887c]">Payouts arrive within 3–5 business days of request.</p>
          </div>
        </div>
      </section>

      <section className="create-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">Upcoming events</h2>
          <Link href="/dashboard/events" className="create-focus text-xs font-semibold text-[#2565d0]">All events →</Link>
        </div>
        {upcomingEvents.length === 0 ? (
          <div className="border-t border-[var(--tikkitte-cream-border)] px-5 py-12 text-center">
            <p className="font-semibold">No upcoming events</p>
            <p className="mt-1 text-sm text-[var(--tikkitte-ink-faint)]">Published events will appear here.</p>
          </div>
        ) : (
          <div>
            {upcomingEvents.map((event, index) => {
              const eventTickets = ticketsByEvent[event.id] ?? []
              const sold = eventTickets.reduce((sum, ticket) => sum + ticket.purchased_quantity, 0)
              const capacity = eventTickets.some((ticket) => ticket.total_quantity === null) ? null : eventTickets.reduce((sum, ticket) => sum + (ticket.total_quantity ?? 0), 0)
              const percent = capacity ? Math.min(100, (sold / capacity) * 100) : 0
              return (
                <Link key={event.id} href={`/dashboard/events/${event.id}`} className={`create-focus grid min-h-[66px] grid-cols-[42px_minmax(0,1fr)] items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--tikkitte-cream)] sm:grid-cols-[42px_minmax(0,1fr)_150px_72px_16px] ${index % 2 ? 'bg-[#faf9f5]' : 'bg-white'}`}>
                  <div className={`create-display flex h-[42px] w-[42px] items-center justify-center rounded-[10px] text-sm text-white ${index % 3 === 1 ? 'bg-[#191917]' : index % 3 === 2 ? 'bg-[#3d3c4a]' : 'bg-[#2e6fe6]'}`}>{initials(event.name)}</div>
                  <div className="min-w-0">
                    <p className="create-display truncate text-[14.5px]">{event.name}</p>
                    <p className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-[#2565d0]">{formatDate(event.date)} · {event.venue ?? 'Venue TBA'}</p>
                  </div>
                  <div className="hidden h-1.5 overflow-hidden rounded-full bg-[var(--tikkitte-cream-border)] sm:block"><div className="h-full rounded-full bg-[#2e6fe6]" style={{ width: `${percent}%` }} /></div>
                  <p className="hidden text-right text-xs text-[var(--tikkitte-ink-soft)] sm:block">{sold}{capacity !== null ? `/${capacity}` : ''}</p>
                  <span className="hidden text-[var(--tikkitte-ink-faint)] sm:block">›</span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
