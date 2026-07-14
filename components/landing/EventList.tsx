import Link from 'next/link'
import type { EventWithPrice } from '@/lib/events'
import { formatEventPrice } from '@/lib/events'
import { formatDate, formatTime } from '@/lib/format'
import PosterFrame from '@/components/PosterFrame'

const fallbackFlyers = [
  '/images/claude-design-assets/flyer-1.png',
  '/images/claude-design-assets/flyer-2.png',
  '/images/claude-design-assets/flyer-3.png',
  '/images/claude-design-assets/flyer-4.png',
  '/images/claude-design-assets/flyer-5.png',
  '/images/claude-design-assets/flyer-6.png',
  '/images/claude-design-assets/flyer-7.png',
  '/images/claude-design-assets/flyer-8.png',
]

export default function EventList({ events }: { events: EventWithPrice[] }) {
  if (events.length === 0) {
    return (
      <div className="py-32">
        <h2 className="font-anton font-normal text-2xl uppercase leading-[1.05] text-[#191917]">No upcoming events right now</h2>
        <p className="mt-2 max-w-xs text-sm text-[#8a887c]">Check back soon — new events are added all the time.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {events.map((event, i) => {
        const eventDateTime = [formatDate(event.date), formatTime(event.time)].filter(Boolean).join(' · ')
        const poster = event.image?.[0] ?? fallbackFlyers[i % fallbackFlyers.length]

        return (
          <Link
            key={event.id}
            href={`/e/${event.slug ?? event.id}`}
            className={`flex flex-wrap items-center gap-[clamp(16px,2.5vw,28px)] py-[22px] transition-colors hover:bg-[#ECE7D8] ${
              i < events.length - 1 ? 'border-b border-[#E7E2D4]' : ''
            }`}
          >
            <PosterFrame src={poster} alt={event.name} sizes="88px" className="aspect-[4/5] w-[88px] flex-shrink-0 rounded-xl bg-[#F4F2EC]" />

            <div className="flex min-w-[220px] flex-1 flex-col gap-1">
              <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#2565D0]">
                {eventDateTime}
              </div>
              <div className="font-anton font-normal text-[clamp(22px,2.6vw,30px)] uppercase leading-[1.05] text-[#191917]">{event.name}</div>
              {event.venue && <div className="text-[15px] text-[#5F5D54]">{event.venue}</div>}
            </div>

            <div className="ml-auto flex flex-wrap items-center gap-5">
              <span className="whitespace-nowrap text-base font-bold text-[#191917]">{formatEventPrice(event.startingPrice)}</span>
              <span className="whitespace-nowrap rounded-full bg-[#2565D0] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1E56B5]">
                Get tickets
              </span>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
