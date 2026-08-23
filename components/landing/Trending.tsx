import Link from 'next/link'
import type { EventWithPrice } from '@/lib/events'
import { formatDateShort } from '@/lib/format'
import PosterFrame from '@/components/PosterFrame'

const fallbackFlyers = [
  '/images/claude-design-assets/flyer-1.png',
  '/images/claude-design-assets/flyer-2.png',
  '/images/claude-design-assets/flyer-3.png',
]

export default function Trending({ events }: { events: EventWithPrice[] }) {
  if (events.length === 0) return null

  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-[clamp(72px,10vh,120px)] lg:px-14">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#2565D0]">This week</div>
          <h2 className="mt-2 font-anton font-normal text-[clamp(36px,5vw,68px)] uppercase leading-[1.02] text-[#191917]">Hot right now</h2>
        </div>
        <Link href="/events" className="whitespace-nowrap rounded-full border-[1.5px] border-[#C8C3B2] px-6 py-3 text-[15px] font-semibold text-[#191917] hover:border-[#191917]">
          See all events →
        </Link>
      </div>

      <div className="mt-11 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.slice(0, 3).map((event, index) => {
          const poster = event.image?.[0] ?? fallbackFlyers[index % fallbackFlyers.length]

          return (
            <Link
              key={event.id}
              href={`/e/${event.slug ?? event.id}`}
              className="flex flex-col overflow-hidden rounded-[20px] border border-[#E4DFD1] bg-white text-[#191917] transition-colors hover:border-[#2565D0]"
            >
              <PosterFrame src={poster} alt={event.name} sizes="(max-width: 768px) 100vw, 33vw" className="aspect-[4/5] bg-[#F4F2EC]" variant="fill" />
              <div className="flex flex-1 flex-col gap-2 p-[22px]">
                <div className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#2565D0]">{formatDateShort(event.date)}</div>
                <div className="font-anton font-normal text-2xl uppercase leading-[1.1]">{event.name}</div>
                <div className="text-sm text-[#5F5D54]">{event.venue}</div>
                <div className="mt-auto pt-3 text-[15px] font-bold text-[#2565D0]">Get tickets</div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
