import Hero from '@/components/landing/Hero'
import Marquee from '@/components/landing/Marquee'
import AttendeeFeatures from '@/components/landing/AttendeeFeatures'
import Trending from '@/components/landing/Trending'
import OrganizerPitch from '@/components/landing/OrganizerPitch'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'
import { getUpcomingEvents } from '@/lib/events'

export const revalidate = 30

export default async function HomePage() {
  const events = await getUpcomingEvents(3)

  return (
    <main className="flex min-h-full flex-col bg-[#F4F2EC] font-grotesk">
      <Hero events={events} />
      <Marquee />
      <AttendeeFeatures events={events} />
      <Trending events={events} />
      <OrganizerPitch />
      <FinalCTA headline={<>Your next night out<br />is one tap away</>} ctaLabel="Browse events" ctaHref="/events" />
      <Footer />
    </main>
  )
}
