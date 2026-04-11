import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Event, Ticket } from '@/lib/types'
import { isValidUUID } from '@/lib/validation'
import EventCheckout from './EventCheckout'
import EventPreviewGallery from '@/components/EventPreviewGallery'

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function formatTime(timeStr: string) {
  const [hh, mm] = timeStr.split(':').map(Number)
  const am = hh < 12
  const h12 = ((hh + 11) % 12) + 1
  return `${h12}:${String(mm).padStart(2, '0')} ${am ? 'AM' : 'PM'}`
}

type Props = {
  params: Promise<{ id: string }>
}

async function getEventData(idOrSlug: string) {
  const supabase = await createClient()
  const isUUID = isValidUUID(idOrSlug)
  const { data: event } = await supabase
    .from('event')
    .select('*')
    .eq(isUUID ? 'id' : 'slug', idOrSlug)
    .maybeSingle()
  if (!event) return null

  const { data: tickets } = await supabase
    .from('ticket')
    .select('id, event_id, type, label, price, total_quantity, purchased_quantity, available_quantity')
    .eq('event_id', event.id)
    .order('price', { ascending: true })

  return { event: event as Event, tickets: (tickets ?? []) as Ticket[] }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const data = await getEventData(id)
  if (!data) return { title: 'Event Not Found | Tikkitte' }

  const { event } = data
  const title = `${event.name} | Tikkitte`
  const description = `${formatDate(event.date)} at ${event.venue ?? 'TBA'}`

  return {
    title,
    description,
    openGraph: {
      title: event.name,
      description,
      type: 'website',
      ...(event.image?.[0] ? { images: [event.image[0]] } : {}),
    },
  }
}

export default async function PublicEventPage({ params }: Props) {
  const { id } = await params
  const data = await getEventData(id)
  if (!data) notFound()

  const { event, tickets } = data

  if (event.cancelled) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Event Cancelled</h1>
        <p className="text-gray-500 mb-8">{event.name} has been cancelled.</p>
        <Link href="/events" className="text-sm font-semibold text-[#3B82F6] hover:text-[#2563EB] transition-colors">
          ← Browse other events
        </Link>
      </div>
    )
  }

  const poster = event.image?.[0]

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 lg:py-16">

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-10 lg:gap-16 items-start">

        {/* ── Left column: event info card + preview gallery ─────────── */}
        <div>

          {/* Event info card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
            {poster ? (
              <div className="relative w-full bg-black" style={{ minHeight: '280px', maxHeight: '600px', height: '55vw' }}>
                {/* Blurred backdrop */}
                <div
                  className="absolute inset-0 scale-110"
                  style={{
                    backgroundImage: `url(${poster})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(28px) brightness(0.45) saturate(1.2)',
                  }}
                />
                {/* Full poster — object-contain so nothing is cropped */}
                <Image
                  src={poster}
                  alt={event.name}
                  fill
                  className="object-contain relative z-10"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  quality={90}
                  priority
                />
              </div>
            ) : (
              <div className="w-full bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center" style={{ height: '220px' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                </svg>
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2" />
              <h1 className="text-xl font-bold text-gray-900 mb-1">{event.name}</h1>
              <p className="text-sm text-gray-500">{formatDate(event.date)} &middot; {formatTime(event.time)}</p>
              {event.venue && (
                event.maps_link ? (
                  <a
                    href={event.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-[#3B82F6] transition-colors"
                  >
                    {event.venue}
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">{event.venue}</p>
                )
              )}
              {event.description && (
                <p className="text-sm text-gray-400 mt-3 leading-relaxed line-clamp-4">
                  {event.description}
                </p>
              )}
            </div>
          </div>

          {/* Preview gallery */}
          {((event.preview_images?.length ?? 0) + (event.preview_videos?.length ?? 0)) > 0 && (
            <div>
              <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Preview</h2>
              <EventPreviewGallery
                images={event.preview_images ?? []}
                videos={event.preview_videos ?? []}
              />
            </div>
          )}
        </div>

        {/* ── Right column: checkout (sticky on desktop) ────────────── */}
        <div className="lg:sticky lg:top-20">

          {/* Ticket checkout */}
          <EventCheckout eventId={event.id} tickets={tickets} eventName={event.name} />

          {/* Back link */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Link
              href="/events"
              className="text-sm font-semibold text-[#3B82F6] hover:text-[#2563EB] transition-colors"
            >
              ← All events
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
