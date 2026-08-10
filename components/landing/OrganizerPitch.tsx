import Link from 'next/link'

const bullets = [
  'Go live in minutes, no approval maze',
  'Live sales dashboard, every ticket in real time',
  'QR scanning at the door for fast, secure entry',
  'Built for Ghana, priced in cedis',
]

export default function OrganizerPitch() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 pt-[clamp(72px,10vh,120px)] lg:px-14">
      <div className="relative grid grid-cols-1 items-center gap-10 overflow-hidden rounded-[28px] bg-[#2565D0] p-[clamp(32px,5vw,64px)] min-[760px]:grid-cols-2">
        <div>
          <div className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#BCD2F7]">For organizers</div>
          <h2 className="mt-4 font-anton font-normal text-[clamp(34px,4.5vw,58px)] uppercase leading-[1.02] !text-white">
            Throwing the party? Sell it here.
          </h2>
          <p className="mt-4 max-w-[460px] text-[17px] leading-relaxed text-[#D9E4FA]">
            Go live in minutes, scan QR codes at the door, and watch sales roll in live. Paid in cedis, straight to you. No spreadsheets.
          </p>
          <div className="mt-7 flex flex-wrap gap-3.5">
            <Link href="/signup" className="rounded-full bg-[#191917] px-[30px] py-[15px] text-base font-bold !text-white hover:bg-black">
              List your event
            </Link>
            <Link href="/organizers" className="rounded-full border-[1.5px] border-white/50 px-[30px] py-[15px] text-base font-bold !text-white hover:border-white">
              Learn more
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {bullets.map((b) => (
            <div key={b} className="rounded-2xl bg-white/[0.12] px-[22px] py-[18px] text-base font-medium !text-white">
              {b}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
