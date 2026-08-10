import { createClient, getAuthedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  const user = await getAuthedUser()
  if (!user) redirect('/login')

  const [{ data: rawEvents }, { data: profile }] = await Promise.all([
    supabase.from('event').select('*').eq('organizer_id', user.id),
    supabase.from('organizer_profile').select('display_name').eq('id', user.id).maybeSingle(),
  ])

  const events = (rawEvents ?? []) as Event[]
  const eventIds = events.map((event) => event.id)

  const [{ data: rawTickets }, { data: rawPayments }] = eventIds.length
    ? await Promise.all([
        supabase
          .from('ticket')
          .select('*')
          .in('event_id', eventIds)
          .eq('is_table_ticket', false),
        supabase
          .from('payments')
          .select('event_id, amount, refund_status')
          .in('event_id', eventIds)
          .in('status', ['success', 'free']),
      ])
    : [{ data: [] }, { data: [] }]

  const grossCollectedByEvent = (rawPayments ?? []).filter((payment) => payment.refund_status !== 'success').reduce((totals: Record<string, number>, payment) => {
    totals[payment.event_id] = (totals[payment.event_id] ?? 0) + (payment.amount ?? 0) / 100
    return totals
  }, {})

  return (
    <div>
      <div className="mb-6 flex items-center justify-between md:hidden">
        <Link href="/dashboard" className="create-focus flex items-center gap-2" aria-label="Tikkitte Create home">
          <Image src="/images/logo.png" alt="" width={44} height={30} className="h-7 w-auto" />
          <span className="rounded-full bg-[#2e6fe6] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">Create</span>
        </Link>
        <span className="create-display flex h-11 w-11 items-center justify-center rounded-full bg-[#2e6fe6] text-sm text-white">{(profile?.display_name ?? user.email ?? 'TK').split(/\s+/).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase()}</span>
      </div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="create-display text-[34px]">Your events</h1>
          <p className="mt-1 hidden text-sm text-[var(--tikkitte-ink-soft)] sm:block">Manage your events and track sales</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/dashboard/transactions" className="create-focus hidden min-h-11 items-center justify-center rounded-full border border-[var(--tikkitte-cream-border)] px-5 text-sm font-semibold sm:inline-flex">Transactions</Link>
          <Link href="/dashboard/events/new" className="create-focus inline-flex min-h-12 items-center justify-center rounded-full bg-[#2e6fe6] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#2565d0]">+ Create event</Link>
        </div>
      </div>

      <DashboardEventsClient
        events={events}
        tickets={(rawTickets ?? []) as Ticket[]}
        grossCollectedByEvent={grossCollectedByEvent}
        initialFilter={parseFilter(filter)}
      />
    </div>
  )
}
