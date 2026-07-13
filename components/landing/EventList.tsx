import Link from 'next/link'
import Image from 'next/image'
import type { EventWithPrice } from '@/lib/events'
import { formatEventPrice } from '@/lib/events'
import { formatDate, formatTime } from '@/lib/format'

export default function EventList({ events }: { events: EventWithPrice[] }) {
  if (events.length === 0) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-lg font-semibold text-[#191917]">No upcoming events right now</h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-[#8a887c]">Check back soon — new events are added all the time.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {events.map((event, i) => {
        const eventDateTime = [formatDate(event.date), formatTime(event.time)].filter(Boolean).join(' · ')

        return (
          <Link
            key={event.id}
            href={`/e/${event.slug ?? event.id}`}
            className={`flex flex-wrap items-center gap-[clamp(16px,2.5vw,28px)] py-[22px] transition-colors hover:bg-[#ECE7D8] ${
              i < events.length - 1 ? 'border-b border-[#E7E2D4]' : ''
            }`}
          >
            <div className="relative h-[110px] w-[88px] flex-shrink-0 overflow-hidden rounded-xl bg-[#F4F2EC]">
              {event.image?.[0] && <Image src={event.image[0]} alt={event.name} fill className="object-cover" sizes="88px" />}
            </div>

            <div className="flex min-w-[220px] flex-1 flex-col gap-1">
              <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#2565D0]">
                {eventDateTime}
              </div>
              <div className="font-anton text-[clamp(22px,2.6vw,30px)] uppercase leading-[1.05] text-[#191917]">{event.name}</div>
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
