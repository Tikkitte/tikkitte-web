import Link from 'next/link'

const steps = [
  { number: '01', title: 'Request access', description: 'Sign up with your email. We approve organizers within 24 hours.' },
  { number: '02', title: 'Create your event', description: 'Add details, upload a photo, set ticket tiers with prices and capacity.' },
  { number: '03', title: 'Go live', description: 'Your event appears on Tikkitte instantly. Fans buy, you get paid.' },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1280px] px-5 pt-[clamp(80px,12vh,130px)] lg:px-14">
      <div className="rounded-[28px] bg-[#2565D0] p-[clamp(36px,5vw,64px)]">
        <div className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#BCD2F7]">Getting started</div>
        <h2 className="mt-3.5 font-anton font-normal text-[clamp(32px,4.5vw,56px)] uppercase leading-[1.02] !text-white">Live in three steps</h2>

        <div className="mt-10 grid grid-cols-1 gap-5 min-[760px]:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="rounded-[18px] bg-white/10 p-[26px]">
              <div className="font-anton font-normal text-[34px] !text-white">{step.number}</div>
              <h3 className="mt-3 font-anton font-normal text-xl uppercase !text-white">{step.title}</h3>
              <p className="mt-2.5 text-[15px] leading-relaxed text-[#D9E4FA]">{step.description}</p>
            </div>
          ))}
        </div>

        <Link href="https://create.tikkitte.com/signup" className="mt-9 inline-block rounded-full bg-[#191917] px-8 py-[15px] text-base font-bold !text-white hover:bg-black">
          Get started for free →
        </Link>
      </div>
    </section>
  )
}
