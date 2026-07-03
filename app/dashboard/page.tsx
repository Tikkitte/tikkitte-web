import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Event, Ticket, PayoutAccount } from '@/lib/types'
import InfoTip from '@/components/ui/InfoTip'
import DashboardRevenueChart from '@/components/dashboard/DashboardRevenueChart'

const PLATFORM_FEE_PCT = Number(process.env.PLATFORM_FEE_PERCENT ?? '5') / 100

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

function eventStatus(event: Event): { label: string; className: string } {
  if (!event.published) return { label: 'Draft', className: 'bg-purple-50 text-purple-700' }
  if (event.cancelled) return { label: 'Cancelled', className: 'bg-red-50 text-red-600' }
  const today = new Date().toISOString().slice(0, 10)
  if (event.date < today) return { label: 'Past', className: 'bg-gray-100 text-gray-500' }
  return { label: 'Upcoming', className: 'bg-green-50 text-green-700' }
}

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: rawEvents }, { data: primaryAccount }] = await Promise.all([
    supabase
      .from('organizer_profile')
      .select('display_name')
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
  ])

  const events = (rawEvents ?? []) as Event[]
  const eventIds = events.map((e) => e.id)

  const [{ data: rawTickets }, { data: rawPayments }] = eventIds.length
    ? await Promise.all([
        supabase.from('ticket').select('*').in('event_id', eventIds),
        supabase
          .from('payments')
          .select('amount, paid_at')
          .in('event_id', eventIds)
          .in('status', ['success', 'free']),
      ])
    : [{ data: [] }, { data: [] }]

  const tickets = (rawTickets ?? []) as Ticket[]
  const payments = (rawPayments ?? []) as { amount: number | null; paid_at: string | null }[]
  const account = primaryAccount as PayoutAccount | null

  const ticketsByEvent = tickets.reduce((acc: Record<string, Ticket[]>, t) => {
    if (!acc[t.event_id]) acc[t.event_id] = []
    acc[t.event_id].push(t)
    return acc
  }, {})

  const totalEvents = events.length
  const totalTicketsSold = tickets.reduce((sum, t) => sum + t.purchased_quantity, 0)
  const totalRevenue = tickets.reduce((sum, t) => sum + t.purchased_quantity * t.price, 0)
  const totalCollected = payments.reduce((sum, p) => sum + (p.amount ?? 0) / 100, 0)
  const platformFee = totalCollected * PLATFORM_FEE_PCT
  const netAvailable = totalCollected - platformFee
  const avgTicketValue = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0

  const today = new Date().toISOString().slice(0, 10)
  const upcomingEvents = events
    .filter((e) => e.published && !e.cancelled && e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)

  const displayName = profile?.display_name ?? user.email ?? 'there'
  const feePct = (PLATFORM_FEE_PCT * 100).toFixed(0)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {displayName}</h1>
          <p className="mt-1 text-sm text-gray-500">Here is your earnings summary.</p>
        </div>
        <Link
          href="/dashboard/events/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#3d3d3d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
          Create event
        </Link>
      </div>

      {/* Earnings + Payout panel */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Earnings card */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5">
            <p className="text-sm text-gray-500">Total collected</p>
            <InfoTip
              text="The actual cash received from ticket buyers via Paystack. May differ from Gross revenue if any payments are pending or failed."
            />
          </div>
          <p className="text-4xl font-extrabold tracking-tight text-gray-900">
            {formatMoney(totalCollected, 2)}
          </p>
          <p className="mt-1 mb-6 text-xs text-gray-400">Across all events</p>
          <DashboardRevenueChart payments={payments} />
        </div>

        {/* Payout panel */}
        <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-sm font-semibold text-gray-900">Payout</h2>

          <div className="mb-5">
            <div className="mb-0.5 flex items-center gap-1.5">
              <p className="text-xs text-gray-400">Available balance</p>
              <InfoTip
                text={`Total collected minus the ${feePct}% Tikkitte platform fee (${formatMoney(platformFee, 2)}). This is the amount you can request to be paid out.`}
                width="w-60"
              />
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-gray-900">
              {formatMoney(netAvailable, 2)}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              After {feePct}% platform fee ({formatMoney(platformFee, 2)})
            </p>
          </div>

          {account ? (
            <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                Payout to
              </p>
              <p className="text-sm font-semibold text-gray-900">{account.provider}</p>
              <p className="text-sm text-gray-600">{account.account_name}</p>
              <p className="mt-0.5 text-xs text-gray-400">{account.account_number}</p>
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-dashed border-gray-200 p-4 text-center">
              <p className="mb-2 text-sm text-gray-500">No payout account added yet</p>
              <Link
                href="/dashboard/settings"
                className="text-xs font-semibold text-[#3d3d3d] underline underline-offset-2 transition-colors hover:text-[#2a2a2a]"
              >
                Add account in Settings →
              </Link>
            </div>
          )}

          <div className="mt-auto space-y-2">
            <a
              href="mailto:support@tikkitte.com?subject=Payout%20Request"
              className="flex w-full items-center justify-center rounded-lg bg-[#3d3d3d] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
            >
              Request payout
            </a>
            <p className="text-center text-xs text-gray-400">Processed within 2–3 business days</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm text-gray-500">Total events</p>
          <p className="text-2xl font-extrabold text-gray-900">{totalEvents}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="mb-1 text-sm text-gray-500">Tickets sold</p>
          <p className="text-2xl font-extrabold text-gray-900">{totalTicketsSold}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5">
            <p className="text-sm text-gray-500">Gross revenue</p>
            <InfoTip
              text="Ticket price × tickets sold across all events. This is what you charged — not necessarily what was collected. Free tickets count as GHS 0."
              width="w-60"
            />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{formatMoney(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5">
            <p className="text-sm text-gray-500">Avg ticket value</p>
            <InfoTip text="Average ticket price across all ticket types and events." />
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{formatMoney(avgTicketValue, 2)}</p>
        </div>
      </div>

      {/* Upcoming events */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold text-gray-900">Upcoming events</h2>
          {events.length > 3 && (
            <Link href="/dashboard/events" className="text-sm font-semibold text-[#3d3d3d] transition-colors hover:text-[#2a2a2a]">
              View all events
            </Link>
          )}
        </div>

        {upcomingEvents.length === 0 ? (
          <div className="py-14 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <p className="mb-1 font-semibold text-gray-700">No upcoming events</p>
            <p className="mb-6 text-sm text-gray-500">Events you publish will appear here.</p>
            <Link
              href="/dashboard/events/new"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#3d3d3d] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
              Create event
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcomingEvents.map((event) => {
              const status = eventStatus(event)
              const sold = (ticketsByEvent[event.id] ?? []).reduce((sum, t) => sum + t.purchased_quantity, 0)
              const poster = event.image?.[0]

              return (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="flex items-center gap-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {poster ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={poster} alt="" className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300" aria-hidden="true">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-gray-900">{event.name}</p>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{formatDate(event.date)}</p>
                  </div>
                  <p className="hidden text-sm font-medium text-gray-600 sm:block">{sold} sold</p>
                  <span className="text-sm font-semibold text-[#3d3d3d]">View details →</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
