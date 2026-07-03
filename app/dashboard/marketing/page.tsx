import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MarketingClient, { type MarketingEvent } from './MarketingClient'

type TicketRecipientRow = {
  event_id: string
  user_id: string
}

type FanRow = {
  user_id: string
}

export default async function MarketingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: events } = await supabase
    .from('event')
    .select('id, name, date, last_alert_sent_at, slug')
    .eq('organizer_id', user.id)
    .order('date', { ascending: false })

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
        .select('event_id, user_id')
        .in('event_id', eventIds)
    : { data: [] }

  const recipientSets = ((ticketCounts ?? []) as TicketRecipientRow[]).reduce(
    (acc: Record<string, Set<string>>, row) => {
      if (!acc[row.event_id]) acc[row.event_id] = new Set<string>()
      acc[row.event_id].add(row.user_id)
      return acc
    },
    {}
  )

  const { data: fans } = await supabase.rpc('get_organizer_fans')
  const totalFans = ((fans ?? []) as FanRow[]).length

  const marketingEvents: MarketingEvent[] = eventRows.map((event) => ({
    id: event.id,
    name: event.name,
    date: event.date,
    last_alert_sent_at: event.last_alert_sent_at,
    recipientCount: recipientSets[event.id]?.size ?? 0,
  }))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="mt-1 text-sm text-gray-500">Message ticket holders for a specific event.</p>
      </div>

      <MarketingClient events={marketingEvents} totalFans={totalFans} />
    </div>
  )
}
