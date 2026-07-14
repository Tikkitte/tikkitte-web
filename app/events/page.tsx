import Link from 'next/link'
import type { Metadata } from 'next'
import Nav from '@/components/landing/Nav'
import EventList from '@/components/landing/EventList'
import Footer from '@/components/landing/Footer'
import { getUpcomingEvents } from '@/lib/events'

export const metadata: Metadata = {
  title: 'Upcoming Events | Tikkitte',
  description: 'Browse upcoming events in Ghana and buy tickets instantly.',
}

export const revalidate = 30

export default async function EventsPage() {
  const events = await getUpcomingEvents(100)

  return (
    <main className="flex min-h-full flex-col bg-[#F4F2EC] font-grotesk">
      <Nav />

      <header className="mx-auto max-w-[1100px] px-5 pt-[clamp(36px,6vh,72px)] lg:px-14">
        <div className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#2565D0]">Ghana&apos;s events</div>
        <h1 className="mt-4 font-anton font-normal text-[clamp(48px,8vw,110px)] uppercase leading-[0.98] text-[#191917]">What&apos;s on</h1>
        <p className="mt-4 max-w-[480px] text-[clamp(16px,1.6vw,19px)] leading-relaxed text-[#5F5D54]">
          Buy tickets in seconds, right here in your browser. No account needed.
        </p>
      </header>

      <section className="mx-auto w-full max-w-[1100px] px-5 pt-11 lg:px-14">
        <EventList events={events} />
      </section>

      <section className="mx-auto w-full max-w-[1100px] px-5 py-[clamp(64px,10vh,100px)] lg:px-14">
        <div className="flex flex-wrap items-center justify-between gap-7 rounded-[24px] bg-[#2565D0] p-[clamp(32px,5vw,56px)]">
          <h2 className="font-anton font-normal text-[clamp(28px,3.8vw,48px)] uppercase leading-[1.02] !text-white">
            Your event belongs on this page.
          </h2>
          <Link href="/organizers" className="whitespace-nowrap rounded-full bg-[#191917] px-[30px] py-[15px] text-base font-bold !text-white hover:bg-black">
            List your event
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
