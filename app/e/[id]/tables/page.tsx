import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isValidUUID } from '@/lib/validation'
import type { Event, TablePackage } from '@/lib/types'
import FloorPlanPicker from './FloorPlanPicker'

export default async function TablesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('event')
    .select('id, slug, name, published, cancelled')
    .eq(isValidUUID(id) ? 'id' : 'slug', id)
    .eq('published', true)
    .eq('cancelled', false)
    .maybeSingle()

  if (!event) notFound()

  const { data: packages, error } = await supabase.rpc('get_public_event_tables', { p_event_id: event.id })
  if (error || !packages?.length) notFound()

  return (
    <FloorPlanPicker
      eventId={event.id}
      eventSlug={event.slug ?? event.id}
      eventName={(event as Pick<Event, 'name'>).name}
      initialPackages={packages as TablePackage[]}
    />
  )
}

