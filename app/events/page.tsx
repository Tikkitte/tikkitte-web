import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/types'
import Nav from '@/components/landing/Nav'
import EventGrid from '@/components/landing/EventGrid'
import Footer from '@/components/landing/Footer'
import WatermarkText from '@/components/landing/WatermarkText'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Upcoming Events | Tikkitte',
  description: 'Browse upcoming events in Ghana and buy tickets instantly.',
}

export default async function EventsPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data } = await supabase
    .from('event')
    .select('id, name, slug, date, time, venue, image, description, cancelled, organizer_id')
    .eq('cancelled', false)
    .gte('date', today)
    .order('date', { ascending: true })
    .limit(100)

  const events = (data ?? []) as Event[]

  return (
    <main className="flex flex-col min-h-full">
      <Nav />

      {/* Page header */}
      <div className="relative overflow-hidden border-b border-gray-100 bg-white">
        {/* Watermark */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-start justify-end pr-6 lg:pr-12 pt-12 select-none"
        >
          <WatermarkText text="EVENTS" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-12 py-12 sm:py-20">
          <span className="text-xs font-semibold tracking-widest text-[#3B82F6] uppercase">
            Ghana&apos;s events
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Upcoming Events
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-lg">
            Find something happening near you. Buy tickets in seconds — no account needed.
          </p>
        </div>
      </div>

      {/* Events list */}
      <div className="flex-1 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12">
          <EventGrid events={events} />
        </div>
      </div>

      <Footer />
    </main>
  )
}
