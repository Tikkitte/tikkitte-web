import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Event, Ticket } from '@/lib/types'
import { isValidUUID } from '@/lib/validation'
import EventCheckout from './EventCheckout'

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

  // Try UUID first, then slug
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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-950 mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Event Cancelled</h1>
        <p className="text-gray-500 dark:text-slate-400">{event.name} has been cancelled.</p>
      </div>
    )
  }

  const poster = event.image?.[0]

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Event poster */}
      {poster && (
        <div className="rounded-2xl overflow-hidden mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt={event.name}
            className="w-full max-h-[420px] object-cover"
          />
        </div>
      )}

      {/* Event info */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {event.name}
        </h1>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            <span className="text-sm font-medium">
              {formatDate(event.date)} &middot; {formatTime(event.time)}
            </span>
          </div>

          {event.venue && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {event.maps_link ? (
                <a
                  href={event.maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium underline underline-offset-2 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {event.venue}
                </a>
              ) : (
                <span className="text-sm font-medium">{event.venue}</span>
              )}
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        )}
      </div>

      {/* Ticket selection + checkout */}
      <EventCheckout eventId={event.id} tickets={tickets} eventName={event.name} />
    </div>
  )
}
