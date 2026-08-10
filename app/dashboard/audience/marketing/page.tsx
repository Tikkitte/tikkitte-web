import { createClient, getAuthedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AudienceHeader from '../AudienceHeader'
import MarketingClient, { type MarketingEvent } from './MarketingClient'

type TicketRecipientRow = {
  event_id: string
  user_id: string
  payment_reference: string | null
}

export default async function AudienceMarketingPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) redirect('/login')

  const [{ data: events }, { data: organizerProfile }] = await Promise.all([
    supabase
      .from('event')
      .select('id, name, date, last_alert_sent_at, slug')
      .eq('organizer_id', user.id)
      .order('date', { ascending: false }),
    supabase
      .from('organizer_profile')
      .select('last_broadcast_sent_at')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  const eventRows = (events ?? []) as Array<{
    id: string
    name: string
    date: string
    last_alert_sent_at: string | null
    slug: string | null
  }>
  const eventIds = eventRows.map((event) => event.id)

  const { data: ticketCounts } = eventIds.length
    ? await supabase
        .from('user_ticket')
        .select('event_id, user_id, payment_reference')
        .in('event_id', eventIds)
    : { data: [] }

  // Complimentary tickets (payment_reference starting "COMP-") are excluded:
  // this count feeds the messaging "Recipients" column, and comp recipients
  // (who may be high-profile guests) should never be reachable through
  // organizer messaging.
  const recipientSets = ((ticketCounts ?? []) as TicketRecipientRow[])
    .filter((row) => !row.payment_reference?.startsWith('COMP-'))
    .reduce(
      (acc: Record<string, Set<string>>, row) => {
        if (!acc[row.event_id]) acc[row.event_id] = new Set<string>()
        acc[row.event_id].add(row.user_id)
        return acc
      },
      {}
    )

  const { data: audience } = await supabase.rpc('get_organizer_audience', {
    p_page: 1,
    p_page_size: 1,
    p_filter: 'all',
    p_search: '',
  })
  const totalFans = Number((audience as { total_count?: number } | null)?.total_count ?? 0)

  const marketingEvents: MarketingEvent[] = eventRows.map((event) => ({
    id: event.id,
    name: event.name,
    date: event.date,
    last_alert_sent_at: event.last_alert_sent_at,
    recipientCount: recipientSets[event.id]?.size ?? 0,
  }))

  return (
    <div>
      <AudienceHeader />
      <MarketingClient
        events={marketingEvents}
        totalFans={totalFans}
        lastBroadcastSentAt={(organizerProfile as { last_broadcast_sent_at: string | null } | null)?.last_broadcast_sent_at ?? null}
      />
    </div>
  )
}
