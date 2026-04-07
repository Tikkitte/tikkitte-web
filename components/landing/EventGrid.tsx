import Link from 'next/link'
import type { Event } from '@/lib/types'

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
  events: Event[]
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ImagePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-50 to-gray-100">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  )
}

export default function EventGrid({ events }: Props) {
  if (events.length === 0) {
    return (
      <div className="py-32 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No upcoming events right now</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto">
          Check back soon — new events are added all the time.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {events.map((event, index) => {
        const poster = event.image?.[0]
        const href = `/e/${event.slug ?? event.id}`

        return (
          <Link
            key={event.id}
            href={href}
            className={`
              group grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-8 lg:gap-16
              py-12 lg:py-16
              ${index < events.length - 1 ? 'border-b border-gray-100' : ''}
            `}
          >
            {/* ── Image ─────────────────────────────────────────────── */}
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
              {poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={poster}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                />
              ) : (
                <ImagePlaceholder />
              )}

              {/* Status badge */}
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[10px] font-bold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full text-gray-900 shadow-sm">
                Upcoming
              </span>
            </div>

            {/* ── Details ───────────────────────────────────────────── */}
            <div className="flex flex-col justify-center">

              {/* Event number — subtle index */}
              <span className="text-xs font-semibold tracking-widest text-gray-300 uppercase mb-4 tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Name */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-5 group-hover:text-[#3B82F6] transition-colors duration-200">
                {event.name}
              </h2>

              {/* Meta */}
              <div className="flex flex-col gap-2.5 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarIcon />
                  <span>{formatDate(event.date)}&nbsp;&middot;&nbsp;{formatTime(event.time)}</span>
                </div>
                {event.venue && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <LocationIcon />
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-sm text-gray-400 leading-relaxed mb-8 line-clamp-2 max-w-sm">
                  {event.description}
                </p>
              )}

              {/* CTA */}
              <div>
                <span className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-6 py-3 rounded-xl group-hover:bg-[#3B82F6] transition-colors duration-200">
                  Get Tickets
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>

            </div>
          </Link>
        )
      })}
    </div>
  )
}
