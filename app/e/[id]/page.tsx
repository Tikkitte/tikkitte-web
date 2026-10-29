import Link from 'next/link'
import { notFound } from 'next/navigation'
import { after } from 'next/server'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import type { Metadata } from 'next'
import type { Event, Ticket } from '@/lib/types'
import { createPublicClient } from '@/lib/supabase/server-public'
import { isValidUUID } from '@/lib/validation'
import EventCheckout from './EventCheckout'
import { serviceFeeBpsFromPercent } from '@/lib/checkout-pricing'
import EventPreviewGallery from '@/components/EventPreviewGallery'
import PosterFrame from '@/components/PosterFrame'
import PosterPlaceholder from '@/components/PosterPlaceholder'
import PosterOutlineCard from '@/components/PosterOutlineCard'
import ExpandableText from '@/components/ExpandableText'
import { formatDate, formatDateShort, formatTime, toTitleCase } from '@/lib/format'

type OrganizerSummary = {
  id: string
  slug: string | null
  display_name: string
  logo_url: string | null
}

type EventCore = Pick<
  Event,
  | 'id'
  | 'name'
  | 'slug'
  | 'date'
  | 'time'
  | 'end_date'
  | 'end_time'
  | 'venue'
  | 'maps_link'
  | 'description'
  | 'image'
  | 'preview_images'
  | 'preview_videos'
  | 'organizer_id'
  | 'listed'
  | 'presale_max_per_email'
>

const EVENT_CORE_COLUMNS =
  'id, name, slug, date, time, end_date, end_time, venue, maps_link, description, image, preview_images, preview_videos, organizer_id, listed, presale_max_per_email'

const refPattern = /^[a-z0-9-]{2,20}$/

function formatEventDateRange(event: Pick<EventCore, 'date' | 'time' | 'end_date' | 'end_time'>) {
  const start = [formatDateShort(event.date), formatTime(event.time)].filter(Boolean).join(' · ')
  // Only show the end side for genuinely multi-day events — same-day end
  // times just added noise to what's otherwise a single date/time line.
  if (!event.end_date || event.end_date === event.date) return start
  const end = [formatDateShort(event.end_date), formatTime(event.end_time)].filter(Boolean).join(' · ')
  return `${start} → ${end}`
}

type Props = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ ref?: string }>
}

async function fetchEventCore(idOrSlug: string) {
  const supabase = createPublicClient()
  const isUUID = isValidUUID(idOrSlug)
  const { data: event, error: eventError } = await supabase
    .from('event')
    .select(EVENT_CORE_COLUMNS)
    .eq(isUUID ? 'id' : 'slug', idOrSlug)
    .maybeSingle()

  if (eventError) {
    console.error('[event-page] failed to load event core:', eventError.message)
    return null
  }
  if (!event) return null

  const { data: organizer, error: organizerError } = event.organizer_id
    ? await supabase
        .from('organizer_profile')
        .select('id, slug, display_name, logo_url')
        .eq('id', event.organizer_id)
        .eq('approved', true)
        .maybeSingle()
    : { data: null, error: null }

  if (organizerError) {
    console.error('[event-page] failed to load organizer:', organizerError.message)
  }

  const { data: feePercent, error: feeError } = await supabase.rpc('get_event_service_fee_percent', { p_event_id: event.id })
  if (feeError) console.error('[event-page] failed to load service fee:', feeError.message)

  return {
    serviceFeeBps: feeError ? null : serviceFeeBpsFromPercent(feePercent),
    event: event as EventCore,
    organizer: organizer as OrganizerSummary | null,
  }
}

const getEventCore = unstable_cache(fetchEventCore, ['event-core'], {
  revalidate: 30,
  tags: ['event-core'],
})

async function fetchEventLiveState(eventId: string) {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('event')
    .select('published, cancelled')
    .eq('id', eventId)
    .maybeSingle()

  if (error) {
    console.error('[event-page] failed to load live event state:', error.message)
  }

  // Fail closed if the live-state lookup is unavailable.
  return {
    published: data?.published ?? false,
    cancelled: data?.cancelled ?? true,
  }
}

async function getEventInventory(eventId: string) {
  const supabase = createPublicClient()
  const [ticketResult, tableResult] = await Promise.all([
    supabase
      .from('ticket')
      .select('id, event_id, type, label, price, total_quantity, purchased_quantity, available_quantity, min_per_order, max_per_order, sale_start_date, sale_start_time, sale_end_date, sale_end_time, is_table_ticket, presale_only')
      .eq('event_id', eventId)
      .eq('is_table_ticket', false)
      .order('price', { ascending: true }),
    supabase.rpc('get_public_event_tables', { p_event_id: eventId }),
  ])

  if (ticketResult.error) {
    console.error('[event-page] failed to load tickets:', ticketResult.error.message)
  }
  if (tableResult.error) {
    console.error('[event-page] failed to load table availability:', tableResult.error.message)
  }

  return {
    tickets: (ticketResult.data ?? []) as Ticket[],
    hasTableReservations: (tableResult.data?.length ?? 0) > 0,
  }
}

const getEventData = cache(async (idOrSlug: string) => {
  const core = await getEventCore(idOrSlug)
  if (!core) return null

  const [liveState, inventory] = await Promise.all([
    fetchEventLiveState(core.event.id),
    getEventInventory(core.event.id),
  ])

  // Preserve the original behavior: unpublished events resolve as not found.
  if (!liveState.published) return null

  return {
    ...core,
    cancelled: liveState.cancelled,
    ...inventory,
  }
})

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
    ...(!event.listed ? { robots: { index: false, follow: false } } : {}),
    openGraph: {
      title,
      description,
      type: 'website',
      ...(event.image?.[0] ? { images: [event.image[0]] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(event.image?.[0] ? { images: [event.image[0]] } : {}),
    },
  }
}

function MapPinIcon() {
  return (
    <svg className="mt-0.5 shrink-0 text-[#2565D0]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

// Only approved organizers are shown on event pages, so every organizer here is verified.
function VerifiedBadge() {
  return (
    <svg className="shrink-0" width="15" height="15" viewBox="0 0 24 24" role="img" aria-label="Verified organizer">
      <title>Verified organizer</title>
      <path fill="#2565D0" d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default async function PublicEventPage({ params, searchParams }: Props) {
  const { id } = await params
  const data = await getEventData(id)
  if (!data) notFound()

  const { event, tickets, organizer, hasTableReservations, cancelled, serviceFeeBps } = data
  const ref = (await searchParams)?.ref?.trim().toLowerCase()
  if (ref && refPattern.test(ref)) {
    const eventId = event.id
    after(async () => {
      const supabase = createPublicClient()
      const { error } = await supabase.rpc('record_tracking_click', {
        p_event_id: eventId,
        p_slug: ref,
      })
      if (error) {
        console.error('[event-page] failed to record referral click:', error.message)
      }
    })
  }

  if (cancelled) {
    return (
      <div className="mx-auto max-w-[1440px] px-6 py-24 text-center lg:px-12">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
          </svg>
        </div>
        <h1 className="mb-2 font-anton font-normal text-4xl uppercase text-[#191917]">Event cancelled</h1>
        <p className="mb-8 text-[#5F5D54]">{event.name} has been cancelled.</p>
        <Link href="/events" className="text-sm font-semibold text-[#2565D0] transition-colors hover:text-[#1E56B5]">
          ← Browse other events
        </Link>
      </div>
    )
  }

  const poster = event.image?.[0]

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-10 lg:px-12 lg:py-16">

      {/* Two-column layout on desktop */}
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[55fr_45fr] lg:gap-16">

        {/* ── Left column: event info card + preview gallery ─────────── */}
        <div>

          {/* Event info card */}
          <PosterOutlineCard
            posterSrc={poster ?? null}
            className="mb-8 w-full max-w-[640px] overflow-hidden rounded-[24px] border-2 bg-white shadow-[0_24px_70px_rgba(25,25,23,0.08)]"
          >
            {poster ? (
              <PosterFrame
                src={poster}
                alt={event.name}
                sizes="(max-width: 1024px) 100vw, 640px"
                quality={90}
                priority
                className="aspect-[3/4] w-full bg-black"
              />
            ) : (
              <PosterPlaceholder className="aspect-[3/4] w-full" />
            )}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2" />
              <h1 className="mb-1 font-anton font-normal text-[clamp(30px,4vw,52px)] uppercase leading-[1.02] text-[#191917]">{event.name}</h1>
              <p className="text-sm font-semibold text-[#2565D0]">{formatEventDateRange(event)}</p>
              {event.venue && (
                event.maps_link ? (
                  <a
                    href={event.maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-start gap-1.5 text-sm text-[#5F5D54] transition-colors hover:text-[#2565D0]"
                  >
                    <MapPinIcon />
                    <span>{toTitleCase(event.venue)}</span>
                  </a>
                ) : (
                  <p className="mt-1 flex items-start gap-1.5 text-sm text-[#5F5D54]">
                    <MapPinIcon />
                    <span>{toTitleCase(event.venue)}</span>
                  </p>
                )
              )}
              {event.description && (
                <ExpandableText text={event.description} className="mt-4 text-sm leading-relaxed text-[#5F5D54]" />
              )}
              {organizer && (
                <Link
                  href={`/o/${organizer.slug ?? organizer.id}`}
                  className="group mt-5 flex items-center gap-2.5 border-t border-[#E7E2D4] pt-4"
                >
                  {organizer.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={organizer.logo_url} className="h-8 w-8 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2565D0]/10 text-xs font-bold text-[#2565D0]">
                      {organizer.display_name[0]?.toUpperCase() ?? 'T'}
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-[#8a887c]">Hosted by</p>
                    <p className="flex items-center gap-1 text-sm font-semibold text-[#191917] transition-colors group-hover:text-[#2565D0]">
                      {organizer.display_name}
                      <VerifiedBadge />
                    </p>
                  </div>
                  <svg className="ml-auto text-[#C8C3B2] transition-colors group-hover:text-[#2565D0]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              )}
            </div>
          </PosterOutlineCard>

          {/* Preview gallery */}
          {((event.preview_images?.length ?? 0) + (event.preview_videos?.length ?? 0)) > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#8a887c]">Preview</h2>
              <EventPreviewGallery
                images={event.preview_images ?? []}
                videos={event.preview_videos ?? []}
              />
            </div>
          )}
        </div>

        {/* ── Right column: checkout (sticky on desktop) ────────────── */}
        <div className="lg:sticky lg:top-24">

          {/* Ticket checkout */}
          <div className="rounded-[24px] border border-[#E4DFD1] bg-white p-5 shadow-[0_24px_70px_rgba(25,25,23,0.08)]">
            {hasTableReservations && (
              <div className="mb-5 border-b border-[#E7E2D4] pb-5">
                <Link
                  href={`/e/${event.slug ?? event.id}/tables`}
                  className="flex w-full items-center justify-between rounded-2xl bg-[#191917] px-5 py-4 text-white transition-colors hover:bg-black"
                >
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-white/55">ARIA tables</span>
                    <span className="mt-1 block text-base font-semibold">Reserve a table</span>
                  </span>
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
            <EventCheckout presaleMaxPerEmail={event.presale_max_per_email} serviceFeeBps={serviceFeeBps} eventId={event.id} eventSlug={event.slug ?? event.id} tickets={tickets} />
          </div>

          {/* Back link */}
          <div className="mt-8 border-t border-[#E7E2D4] pt-6">
            <Link
              href="/events"
              className="text-sm font-semibold text-[#2565D0] transition-colors hover:text-[#1E56B5]"
            >
              ← All events
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
