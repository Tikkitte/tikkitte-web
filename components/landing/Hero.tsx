import Link from 'next/link'
import Image from 'next/image'
import Nav from './Nav'
import type { EventWithPrice } from '@/lib/events'
import { formatDate } from '@/lib/format'

type Props = {
  events: EventWithPrice[]
}

function QrMark() {
  const filled = new Set([0, 1, 2, 4, 6, 9, 11, 13, 14, 15])
  return (
    <div className="grid w-full grid-cols-4 grid-rows-4 gap-[3px] rounded-2xl bg-white p-3 shadow-[0_18px_40px_rgba(25,25,23,0.13)]">
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className={`aspect-square rounded-[2px] ${filled.has(i) ? 'bg-[#191917]' : 'bg-[#E4DFD1]'}`} />
      ))}
    </div>
  )
}

function BarcodeStrip({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-10 items-end gap-[3px] rounded-[10px] bg-white/90 px-3 py-2 opacity-90 ${className}`}>
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} style={{ height: `${(i % 5) * 4 + 8}px` }} className="w-[2px] bg-[#191917]" />
      ))}
    </div>
  )
}

export default function Hero({ events }: Props) {
  const rows = events.slice(0, 3)

  return (
    <section className="relative overflow-hidden bg-[#F4F2EC]">
      <Nav />

      <header className="px-5 pt-[clamp(40px,7vh,80px)] text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E4DFD1] bg-white px-[18px] py-2 text-[13px] font-semibold uppercase tracking-[0.14em] text-[#2565D0]">
          <span className="h-2 w-2 rounded-full bg-[#2565D0]" />
          Now live in Ghana
        </div>

        <h1 className="mx-auto mt-7 max-w-[1100px] font-anton text-[clamp(52px,9vw,132px)] uppercase leading-[0.98] tracking-[0.01em] text-[#191917]">
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
                <div className="mt-1.5 font-anton text-[clamp(26px,3.6vw,48px)] uppercase leading-none text-[#191917]">What&apos;s on</div>
              </div>
              {rows.length > 0 && (
                <div className="flex flex-col">
                  {rows.map((event) => (
                    <Link
                      key={event.id}
                      href={`/e/${event.slug ?? event.id}`}
                      className="flex items-center gap-[clamp(10px,1.6vw,20px)] border-t border-[#E7E2D4] py-[clamp(8px,1.2vw,14px)]"
                    >
                      <div className="relative h-[clamp(42px,5vw,64px)] w-[clamp(34px,4vw,52px)] flex-shrink-0 overflow-hidden rounded-lg bg-white">
                        {event.image?.[0] && <Image src={event.image[0]} alt="" fill className="object-cover" sizes="52px" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[clamp(9px,0.9vw,12px)] font-bold uppercase tracking-[0.1em] text-[#2565D0]">{formatDate(event.date)}</div>
                        <div className="truncate font-anton text-[clamp(14px,1.7vw,22px)] uppercase leading-tight text-[#191917]">{event.name}</div>
                        <div className="truncate text-[clamp(10px,1vw,13px)] text-[#8a887c]">{event.venue}</div>
                      </div>
                      <span className="whitespace-nowrap rounded-full bg-[#2565D0] px-[clamp(12px,1.6vw,20px)] py-[clamp(6px,0.8vw,10px)] text-[clamp(9px,1vw,13px)] font-bold text-white">
                        Get tickets
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="absolute right-[clamp(-8px,2vw,60px)] top-[-44px] z-[3] w-[clamp(90px,11vw,150px)] rotate-[8deg]">
            <QrMark />
          </div>

          <Image
            src="/images/logo-square.png"
            alt=""
            width={140}
            height={140}
            className="absolute left-[clamp(-6px,2vw,48px)] top-[-30px] z-[3] w-[clamp(80px,10vw,140px)] -rotate-[10deg] rounded-[22%] drop-shadow-[0_16px_30px_rgba(25,25,23,0.13)]"
          />

          {rows[0]?.image?.[0] && (
            <div className="absolute bottom-[-30px] left-[clamp(-30px,-1vw,10px)] z-[3] h-[clamp(76px,9vw,124px)] w-[clamp(100px,12vw,170px)] -rotate-[7deg] overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(25,25,23,0.13)]">
              <Image src={rows[0].image[0]} alt="" fill className="object-cover" sizes="170px" />
            </div>
          )}

          <div className="absolute bottom-[-20px] right-[clamp(0px,3.5vw,110px)] z-[3] rotate-[5deg] rounded-full bg-[#2565D0] px-[26px] py-3.5 font-anton text-[clamp(15px,1.6vw,22px)] uppercase tracking-[0.06em] text-white shadow-[0_18px_40px_rgba(25,25,23,0.13)]">
            Accra&nbsp;●&nbsp;Tonight
          </div>

          <BarcodeStrip className="absolute bottom-[-34px] left-1/2 z-[1] w-[clamp(140px,18vw,240px)] -translate-x-[70%] -rotate-[3deg]" />
        </div>
      </header>
    </section>
  )
}
