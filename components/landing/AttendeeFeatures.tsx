import Image from 'next/image'
import type { EventWithPrice } from '@/lib/events'

const fallbackFlyers = [
  '/images/claude-design-assets/flyer-palmwine.png',
  '/images/claude-design-assets/flyer-neon.png',
  '/images/claude-design-assets/flyer-courtyard.png',
]

export default function AttendeeFeatures({ events }: { events: EventWithPrice[] }) {
  const flyers = [
    ...events.map((event) => event.image?.[0]).filter((src): src is string => Boolean(src)),
    ...fallbackFlyers,
  ].slice(0, 3)

  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-[clamp(72px,10vh,120px)] lg:px-14">
      <div className="text-center">
        <div className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#2565D0]">For event-goers</div>
        <h2 className="mx-auto mt-4 max-w-[820px] font-anton font-normal text-[clamp(36px,5vw,68px)] uppercase leading-[1.02] text-[#191917]">
          Going out, made stupid simple
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-5 min-[760px]:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-[24px] border border-[#E4DFD1] bg-white p-8">
          <div className="flex h-[170px] items-center justify-center rounded-2xl bg-[#F4F2EC]">
            <Image
              src="/images/claude-design-assets/qr-sticker.png"
              alt="QR ticket"
              width={120}
              height={120}
              className="h-auto w-[120px] -rotate-[4deg] rounded-[14px]"
              style={{ height: 'auto' }}
            />
          </div>
          <h3 className="mt-2 font-anton font-normal text-[26px] uppercase text-[#191917]">Your ticket is a QR code</h3>
          <p className="text-base leading-relaxed text-[#5F5D54]">
            Buy in seconds and get a unique QR straight to your phone. Flash it at the door. No printing, no screenshots, no stress.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-[24px] border border-[#E4DFD1] bg-white p-8">
          <div className="flex h-[170px] items-center justify-center gap-0 overflow-hidden rounded-2xl bg-[#F4F2EC]">
            {flyers.map((src, i) => (
              <Image
                key={`${src}-${i}`}
                src={src}
                alt=""
                width={100}
                height={130}
                className={`h-auto rounded-[10px] shadow-[0_12px_28px_rgba(25,25,23,0.13)] ${
                  i === 0 ? 'w-[92px] -rotate-[8deg] translate-x-[14px]' : i === 1 ? 'relative z-[1] w-[100px] -translate-y-1.5 shadow-[0_12px_28px_rgba(25,25,23,0.16)]' : 'w-[92px] rotate-[8deg] -translate-x-[14px]'
                }`}
                style={{ height: 'auto' }}
              />
            ))}
          </div>
          <h3 className="mt-2 font-anton font-normal text-[26px] uppercase text-[#191917]">Find your next night out</h3>
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
          <h3 className="mt-2 font-anton font-normal text-[26px] uppercase text-[#191917]">Reminders that work</h3>
          <p className="text-base leading-relaxed text-[#5F5D54]">
            A nudge 24 hours before and again at the 1-hour mark. You bought the ticket, we make sure you show up.
          </p>
        </div>
      </div>
    </section>
  )
}
