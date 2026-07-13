import Image from 'next/image'
import type { EventWithPrice } from '@/lib/events'

function QrMark() {
  const filled = new Set([0, 1, 2, 4, 6, 9, 11, 13, 14, 15])
  return (
    <div className="grid w-[120px] -rotate-[4deg] grid-cols-4 grid-rows-4 gap-[3px] rounded-2xl bg-white p-3 shadow-[0_12px_28px_rgba(25,25,23,0.13)]">
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className={`aspect-square rounded-[2px] ${filled.has(i) ? 'bg-[#191917]' : 'bg-[#E4DFD1]'}`} />
      ))}
    </div>
  )
}

export default function AttendeeFeatures({ events }: { events: EventWithPrice[] }) {
  const flyers = events.filter((e) => e.image?.[0]).slice(0, 3)

  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-[clamp(72px,10vh,120px)] lg:px-14">
      <div className="text-center">
        <div className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#2565D0]">For event-goers</div>
        <h2 className="mx-auto mt-4 max-w-[820px] font-anton text-[clamp(36px,5vw,68px)] uppercase leading-[1.02] text-[#191917]">
          Going out, made stupid simple
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <div className="flex flex-col gap-4 rounded-[24px] border border-[#E4DFD1] bg-white p-8">
          <div className="flex h-[170px] items-center justify-center rounded-2xl bg-[#F4F2EC]">
            <QrMark />
          </div>
          <h3 className="mt-2 font-anton text-[26px] uppercase text-[#191917]">Your ticket is a QR code</h3>
          <p className="text-base leading-relaxed text-[#5F5D54]">
            Buy in seconds and get a unique QR straight to your phone. Flash it at the door. No printing, no screenshots, no stress.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-[24px] border border-[#E4DFD1] bg-white p-8">
          <div className="flex h-[170px] items-center justify-center gap-0 overflow-hidden rounded-2xl bg-[#F4F2EC]">
            {flyers.map((event, i) => (
              <div
                key={event.id}
                className={`relative h-[92px] w-[76px] overflow-hidden rounded-[10px] shadow-[0_12px_28px_rgba(25,25,23,0.13)] ${
                  i === 0 ? '-rotate-[8deg] translate-x-3' : i === 1 ? 'z-[1] -translate-y-1.5' : 'rotate-[8deg] -translate-x-3'
                }`}
              >
                <Image src={event.image![0]} alt="" fill className="object-cover" sizes="76px" />
              </div>
            ))}
          </div>
          <h3 className="mt-2 font-anton text-[26px] uppercase text-[#191917]">Find your next night out</h3>
          <p className="text-base leading-relaxed text-[#5F5D54]">
            Concerts, parties, beach days, game nights. Everything happening near you, updated live as events drop.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-[24px] border border-[#E4DFD1] bg-white p-8">
          <div className="flex h-[170px] flex-col justify-center gap-2.5 rounded-2xl bg-[#F4F2EC] px-5">
            <div className="flex items-center gap-2.5 rounded-xl border border-[#E4DFD1] bg-white px-4 py-3 text-sm">
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#2565D0]" />
              <span><strong>Tomorrow, 9 PM:</strong> you&apos;ve got tickets to On A Tuesday</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-[#E4DFD1] bg-white px-4 py-3 text-sm opacity-60">
              <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#2565D0]" />
              <span><strong>In 1 hour:</strong> doors open at Kruna The Club</span>
            </div>
          </div>
          <h3 className="mt-2 font-anton text-[26px] uppercase text-[#191917]">Reminders that work</h3>
          <p className="text-base leading-relaxed text-[#5F5D54]">
            A nudge 24 hours before and again at the 1-hour mark. You bought the ticket, we make sure you show up.
          </p>
        </div>
      </div>
    </section>
  )
}
