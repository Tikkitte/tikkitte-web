import { createClient } from '@/lib/supabase/server'
import type { Event, Ticket } from '@/lib/types'

export type MarketingEvent = Pick<
  Event,
  | 'id' | 'name' | 'slug' | 'date' | 'time' | 'venue' | 'image'
  | 'description' | 'cancelled' | 'organizer_id' | 'published' | 'end_date' | 'end_time'
>

export type EventWithPrice = MarketingEvent & { startingPrice: number | null }

export async function getUpcomingEvents(limit: number): Promise<EventWithPrice[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: events, error: eventsError } = await supabase
    .from('event')
    .select('id, name, slug, date, time, venue, image, description, cancelled, organizer_id, published, end_date, end_time')
    .eq('cancelled', false)
    .eq('published', true)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(limit)

  if (eventsError) {
    console.error('[getUpcomingEvents] failed to load events:', eventsError.message)
    return []
  }

  const list = (events ?? []) as MarketingEvent[]
  if (list.length === 0) return []

  const { data: tickets, error: ticketsError } = await supabase
    .from('ticket')
    .select('event_id, price')
    .in('event_id', list.map((e) => e.id))
    .eq('is_table_ticket', false)

  if (ticketsError) {
    console.error('[getUpcomingEvents] failed to load ticket prices:', ticketsError.message)
  }

  const startingPriceByEvent = new Map<string, number>()
  for (const t of (tickets ?? []) as Pick<Ticket, 'event_id' | 'price'>[]) {
    const current = startingPriceByEvent.get(t.event_id)
    if (current === undefined || t.price < current) {
      startingPriceByEvent.set(t.event_id, t.price)
    }
  }

  return list.map((event) => ({
    ...event,
    startingPrice: startingPriceByEvent.get(event.id) ?? null,
  }))
}

export function formatEventPrice(price: number | null): string {
  if (price === null) return 'TBA'
  if (price === 0) return 'Free'
  return Number.isInteger(price) ? `GH₵ ${price}` : `GH₵ ${price.toFixed(2)}`
}
