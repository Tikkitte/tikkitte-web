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

        {/* ── Left column: poster + description ────────────────────── */}
        <div>
          {/* Poster */}
          <div className="relative rounded-2xl overflow-hidden bg-gray-100 mb-8 aspect-[16/10]">
            {poster ? (
              <Image
                src={poster}
                alt={event.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
                quality={90}
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>

          {/* Preview gallery */}
          {((event.preview_images?.length ?? 0) + (event.preview_videos?.length ?? 0)) > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">Preview</h2>
              <EventPreviewGallery
                images={event.preview_images ?? []}
                videos={event.preview_videos ?? []}
              />
            </div>
          )}

          {/* Description — desktop only (mobile shows below checkout) */}
          {event.description && (
            <div className="hidden lg:block">
              <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">About this event</h2>
              <p className="text-gray-500 leading-relaxed whitespace-pre-line text-sm">
                {event.description}
              </p>
            </div>
          )}
        </div>

        {/* ── Right column: meta + checkout (sticky on desktop) ────── */}
        <div className="lg:sticky lg:top-24">

          {/* Status badge */}
          <span className="inline-block text-[10px] font-bold tracking-[0.15em] uppercase bg-blue-50 text-[#3B82F6] px-3 py-1.5 rounded-full mb-5">
            Upcoming
          </span>

          {/* Event name */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-6">
            {event.name}
          </h1>

          {/* Date + venue */}
          <div className="flex flex-col gap-3 pb-6 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B82F6]">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <span className="text-sm font-semibold">
                {formatDate(event.date)} &middot; {formatTime(event.time)}
              </span>
            </div>

            {event.venue && (
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#3B82F6]">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                {event.maps_link ? (
                  <a
                    href={event.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-[#3B82F6] underline underline-offset-2 hover:text-[#2563EB] transition-colors"
                  >
                    {event.venue}
                  </a>
                ) : (
                  <span className="text-sm font-semibold">{event.venue}</span>
                )}
              </div>
            )}
          </div>

          {/* Ticket checkout */}
          <EventCheckout eventId={event.id} tickets={tickets} eventName={event.name} />

          {/* Description — mobile only */}
          {event.description && (
            <div className="lg:hidden mt-8 pt-6 border-t border-gray-100">
              <h2 className="text-xs font-semibold tracking-widest text-gray-400 uppercase mb-3">About this event</h2>
              <p className="text-gray-500 leading-relaxed whitespace-pre-line text-sm">
                {event.description}
              </p>
            </div>
          )}

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
