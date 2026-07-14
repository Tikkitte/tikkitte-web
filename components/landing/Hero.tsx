import Link from 'next/link'
import Image from 'next/image'
import Nav from './Nav'
import type { EventWithPrice } from '@/lib/events'
import { formatDate, formatTime } from '@/lib/format'

type Props = {
  events: EventWithPrice[]
}

const fallbackFlyers = [
  '/images/claude-design-assets/flyer-palmwine.png',
  '/images/claude-design-assets/flyer-neon.png',
  '/images/claude-design-assets/flyer-vinyl.png',
]

const fallbackRows = [
  {
    id: 'fallback-palm-wine',
    href: '/events',
    poster: '/images/claude-design-assets/flyer-palmwine.png',
    dateLabel: 'Jul 18 · 5:00 PM',
    name: 'Palm Wine Social',
    venue: 'Afrikana Beach House',
  },
  {
    id: 'fallback-neon-rooftop',
    href: '/events',
    poster: '/images/claude-design-assets/flyer-neon.png',
    dateLabel: 'Jul 24 · 9:00 PM',
    name: 'Neon Rooftop',
    venue: 'Luna Rooftop Bar',
  },
  {
    id: 'fallback-vinyl-vibes',
    href: '/events',
    poster: '/images/claude-design-assets/flyer-vinyl.png',
    dateLabel: 'Aug 1 · 8:00 PM',
    name: 'Vinyl & Vibes',
    venue: 'SOHO',
  },
]

export default function Hero({ events }: Props) {
  const eventRows = events.slice(0, 3).map((event, index) => ({
    id: event.id,
    href: `/e/${event.slug ?? event.id}`,
    poster: event.image?.[0] ?? fallbackFlyers[index % fallbackFlyers.length],
    dateLabel: [formatDate(event.date), formatTime(event.time)].filter(Boolean).join(' · '),
    name: event.name,
    venue: event.venue,
  }))
  const rows = [...eventRows, ...fallbackRows].slice(0, 3)
  const collageImage = rows[0]?.poster ?? '/images/claude-design-assets/flyer-courtyard.png'

  return (
    <section className="relative overflow-hidden bg-[#F4F2EC]">
      <Nav />

      <header className="px-5 pt-[clamp(40px,7vh,80px)] text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E4DFD1] bg-white px-[18px] py-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#2565D0]">
          <span className="h-2 w-2 rounded-full bg-[#2565D0]" />
          Now live in Ghana
        </div>

        <h1 className="mx-auto mt-7 max-w-[1100px] font-anton font-normal text-[clamp(52px,9vw,132px)] uppercase leading-[0.98] tracking-[0.01em] text-[#191917]">
          Ghana&apos;s home<br />for live events
        </h1>

        <p className="mx-auto mt-6 max-w-[520px] text-[clamp(16px,1.6vw,20px)] leading-relaxed text-[#5F5D54]">
          Find the night, buy the ticket, walk in. Straight from your browser. No app, no account, no stress.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <Link href="/events" className="rounded-full bg-[#2565D0] px-[34px] py-4 text-[17px] font-bold text-white transition-colors hover:bg-[#1E56B5]">
            Browse events
          </Link>
          <Link href="/organizers" className="rounded-full border-[1.5px] border-[#C8C3B2] px-[34px] py-4 text-[17px] font-bold text-[#191917] transition-colors hover:border-[#191917]">
            List your event
          </Link>
        </div>

        <div className="relative mx-auto mt-16 max-w-[1200px] px-3 pb-16">
          <div className="relative z-[2] mx-auto max-w-[820px] rounded-[24px] border border-[#E4DFD1] bg-white p-3.5 shadow-[0_40px_90px_rgba(25,25,23,0.16)]">
            <div className="flex gap-[7px] px-1.5 pb-3 pt-0.5">
              <span className="h-[11px] w-[11px] rounded-full bg-[#C8C3B2]" />
              <span className="h-[11px] w-[11px] rounded-full bg-[#C8C3B2]" />
              <span className="h-[11px] w-[11px] rounded-full bg-[#C8C3B2]" />
            </div>
            <div className="flex min-h-[clamp(240px,38vw,440px)] flex-col justify-center gap-[clamp(10px,1.4vw,18px)] rounded-[14px] bg-[#F4F2EC] px-[clamp(16px,3vw,44px)] py-[clamp(16px,2.6vw,36px)] text-left">
              <div>
                <div className="text-[clamp(10px,1vw,13px)] font-bold uppercase tracking-[0.16em] text-[#2565D0]">Ghana&apos;s events</div>
                <div className="mt-1.5 font-anton font-normal text-[clamp(26px,3.6vw,48px)] uppercase leading-none text-[#191917]">What&apos;s on</div>
              </div>
              <div className="flex flex-col">
                {rows.map((event) => (
                  <Link
                    key={event.id}
                    href={event.href}
                    className="flex items-center gap-[clamp(10px,1.6vw,20px)] border-t border-[#E7E2D4] py-[clamp(8px,1.2vw,14px)]"
                  >
                    <div className="relative h-[clamp(42px,5vw,64px)] w-[clamp(34px,4vw,52px)] flex-shrink-0 overflow-hidden rounded-lg bg-white">
                      <Image src={event.poster} alt="" fill className="object-cover" sizes="52px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[clamp(9px,0.9vw,12px)] font-bold uppercase tracking-[0.1em] text-[#2565D0]">
                        {event.dateLabel}
                      </div>
                      <div className="truncate font-anton font-normal text-[clamp(14px,1.7vw,22px)] uppercase leading-tight text-[#191917]">{event.name}</div>
                      <div className="truncate text-[clamp(10px,1vw,13px)] text-[#8a887c]">{event.venue}</div>
                    </div>
                    <span className="whitespace-nowrap rounded-full bg-[#2565D0] px-[clamp(12px,1.6vw,20px)] py-[clamp(6px,0.8vw,10px)] text-[clamp(9px,1vw,13px)] font-bold text-white">
                      Get tickets
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <Image
            src="/images/claude-design-assets/qr-sticker.png"
            alt=""
            width={150}
            height={150}
            className="absolute right-[clamp(-8px,2vw,60px)] top-[-44px] z-[3] h-auto w-[clamp(90px,11vw,150px)] rotate-[8deg] rounded-[18px] shadow-[0_18px_40px_rgba(25,25,23,0.13)]"
            style={{ height: 'auto' }}
          />

          <Image
            src="/images/logo-square.png"
            alt=""
            width={140}
            height={140}
            className="absolute left-[clamp(-6px,2vw,48px)] top-[-30px] z-[3] h-auto w-[clamp(80px,10vw,140px)] -rotate-[10deg] rounded-[22%] drop-shadow-[0_16px_30px_rgba(25,25,23,0.13)]"
            style={{ height: 'auto' }}
          />

          <div className="absolute bottom-[-30px] left-[clamp(-30px,-1vw,10px)] z-[3] h-[clamp(76px,9vw,124px)] w-[clamp(100px,12vw,170px)] -rotate-[7deg] overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(25,25,23,0.13)]">
            <Image src={collageImage} alt="" fill className="object-cover" sizes="170px" />
          </div>

          <div className="absolute bottom-[-20px] right-[clamp(0px,3.5vw,110px)] z-[3] rotate-[5deg] rounded-full bg-[#2565D0] px-[26px] py-3.5 font-anton font-normal text-[clamp(15px,1.6vw,22px)] uppercase tracking-[0.06em] text-white shadow-[0_18px_40px_rgba(25,25,23,0.13)]">
            Accra&nbsp;●&nbsp;Tonight
          </div>

          <Image
            src="/images/claude-design-assets/barcode.png"
            alt=""
            width={240}
            height={64}
            className="absolute bottom-[-34px] left-1/2 z-[1] h-auto w-[clamp(140px,18vw,240px)] -translate-x-[70%] -rotate-[3deg] rounded-[10px] opacity-90"
            style={{ height: 'auto' }}
          />
        </div>
      </header>
    </section>
  )
}
