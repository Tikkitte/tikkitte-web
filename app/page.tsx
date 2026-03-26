import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/types'
import Hero from '@/components/landing/Hero'
import EventGrid from '@/components/landing/EventGrid'
import OrganizerCTA from '@/components/landing/OrganizerCTA'
import Footer from '@/components/landing/Footer'

export default async function HomePage() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await supabase
    .from('event')
    .select('id, name, slug, date, time, venue, image, cancelled, organizer_id')
    .eq('cancelled', false)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(100)

  const events = (data ?? []) as Event[]

  return (
    <main className="flex flex-col min-h-full">
      <Hero />
      <EventGrid events={events} />
      <OrganizerCTA />
      <Footer />
    </main>
  )
}
