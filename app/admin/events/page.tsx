import { createClient } from '@/lib/supabase/server'
import AdminPageHeader from '../AdminPageHeader'
import EventsClient, { type EventFeeAdminRow } from './EventsClient'

type AdminEvent = {
  id: string
  name: string
  slug: string | null
  date: string | null
  organizer_id: string | null
  published: boolean
  cancelled: boolean
}

type OrganizerSummary = {
  id: string
  display_name: string
  email: string
}

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: rawEvents } = await supabase
    .from('event')
    .select('id, name, slug, date, organizer_id, published, cancelled')
    .order('date', { ascending: false, nullsFirst: false })
    .limit(300)

  const events = (rawEvents ?? []) as AdminEvent[]
  const eventIds = events.map((event) => event.id)
  const organizerIds = Array.from(new Set(events
    .map((event) => event.organizer_id)
    .filter((id): id is string => Boolean(id))))

  const [{ data: terms }, { data: organizers }] = await Promise.all([
    eventIds.length
      ? supabase.from('event_payout_terms').select('event_id, platform_fee_percent').in('event_id', eventIds)
      : Promise.resolve({ data: [] as Array<{ event_id: string; platform_fee_percent: number }> }),
    organizerIds.length
      ? supabase.from('organizer_profile').select('id, display_name, email').in('id', organizerIds)
      : Promise.resolve({ data: [] as OrganizerSummary[] }),
  ])

  const feeByEvent = new Map((terms ?? []).map((term) => [term.event_id, Number(term.platform_fee_percent)]))
  const organizerById = new Map(((organizers ?? []) as OrganizerSummary[]).map((organizer) => [organizer.id, organizer]))
  const rows: EventFeeAdminRow[] = events.map((event) => ({
    ...event,
    fee_percent: feeByEvent.get(event.id) ?? null,
    organizer: event.organizer_id ? organizerById.get(event.organizer_id) : undefined,
  }))

  return (
    <div>
      <AdminPageHeader
        title="Events"
        description="Review and renegotiate each event’s platform fee. Changes affect unsettled revenue and future sales; completed payouts never change."
      />
      <EventsClient rows={rows} />
    </div>
  )
}
