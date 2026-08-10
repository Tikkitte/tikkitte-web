import Link from 'next/link'
import Image from 'next/image'
import Nav from './Nav'

export default function OrganizerHero() {
  return (
    <section className="bg-[#F4F2EC]">
      <Nav listEventHref="/signup" />

      <div className="mx-auto max-w-[1280px] px-5 pt-[clamp(40px,7vh,80px)] text-center lg:px-14">
        <div className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#2565D0]">For organizers</div>
        <h1 className="mx-auto mt-4 max-w-[1000px] font-anton font-normal text-[clamp(48px,8.5vw,120px)] uppercase leading-[0.98] text-[#191917]">
          Sell out faster.<br /><span className="text-[#2E6FE6]">Get paid directly.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-[540px] text-[clamp(16px,1.6vw,20px)] leading-relaxed text-[#5F5D54]">
          List your event in minutes and reach thousands of people actively looking for something to do. No spreadsheets, no stress.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3.5">
          <Link href="/signup" className="rounded-full bg-[#2565D0] px-[34px] py-4 text-[17px] font-bold text-white hover:bg-[#1E56B5]">
            List your event for free
          </Link>
          <Link href="/login" className="rounded-full border-[1.5px] border-[#C8C3B2] px-[34px] py-4 text-[17px] font-bold text-[#191917] hover:border-[#191917]">
            Organizer sign in
          </Link>
        </div>

        <div className="relative mx-auto mt-[60px] max-w-[960px] pb-8 text-left">
          <div className="rounded-[24px] border border-[#E4DFD1] bg-white p-3.5 shadow-[0_40px_90px_rgba(25,25,23,0.16)]">
            <div className="flex gap-[7px] px-1.5 pb-3 pt-0.5">
              <span className="h-[11px] w-[11px] rounded-full bg-[#C8C3B2]" />
              <span className="h-[11px] w-[11px] rounded-full bg-[#C8C3B2]" />
              <span className="h-[11px] w-[11px] rounded-full bg-[#C8C3B2]" />
            </div>
            <div className="flex flex-col gap-[18px] rounded-[14px] bg-[#F4F2EC] p-[clamp(18px,3vw,32px)]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-[clamp(17px,2vw,22px)] font-bold">Welcome back, Ama</div>
                  <div className="text-sm text-[#8a887c]">Here is your earnings summary.</div>
                </div>
                <span className="rounded-full bg-[#2565D0] px-5 py-2.5 text-sm font-semibold text-white">+ Create event</span>
              </div>

              <div className="grid grid-cols-1 gap-3.5 min-[760px]:grid-cols-[minmax(0,1.35fr)_minmax(220px,0.65fr)]">
                <div className="min-w-0 rounded-[14px] border border-[#E4DFD1] bg-white p-5">
                  <div className="text-[13px] text-[#8a887c]">Total collected</div>
                  <div className="mt-1 text-[clamp(24px,3vw,34px)] font-bold">GH₵ 48,210.50</div>
                  <div className="text-xs text-[#8a887c]">Across all events</div>
                  <svg viewBox="0 0 400 110" className="mt-3.5 block w-full" preserveAspectRatio="none">
                    <path d="M0,100 C60,98 90,92 130,80 C170,68 190,84 230,74 C270,64 310,40 400,12 L400,110 L0,110 Z" fill="#2565D0" opacity="0.18" />
                    <path d="M0,100 C60,98 90,92 130,80 C170,68 190,84 230,74 C270,64 310,40 400,12" fill="none" stroke="#2E6FE6" strokeWidth="3" />
                  </svg>
                </div>
                <div className="flex min-w-0 flex-col gap-2 rounded-[14px] border border-[#E4DFD1] bg-white p-5">
                  <div className="text-[13px] text-[#8a887c]">Available balance</div>
                  <div className="text-[clamp(20px,2.4vw,28px)] font-bold">GH₵ 45,800.00</div>
                  <span className="mt-auto rounded-full bg-[#191917] px-4 py-2.5 text-center text-[13px] font-bold text-[#F4F2EC]">Request payout</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 min-[760px]:grid-cols-3">
                {[['Total events', '14'], ['Tickets sold', '1,268'], ['Avg ticket value', 'GH₵ 38']].map(([label, value]) => (
                  <div key={label} className="rounded-[14px] border border-[#E4DFD1] bg-white px-5 py-4">
                    <div className="text-[13px] text-[#8a887c]">{label}</div>
                    <div className="mt-1 text-[22px] font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Image
            src="/images/claude-design-assets/barcode.png"
            alt=""
            width={200}
            height={54}
            className="absolute bottom-1 right-[clamp(-10px,1vw,30px)] h-auto w-[clamp(130px,16vw,200px)] rotate-[4deg] rounded-[10px] shadow-[0_16px_36px_rgba(25,25,23,0.13)]"
            style={{ height: 'auto' }}
          />
        </div>
      </div>
    </section>
  )
}
