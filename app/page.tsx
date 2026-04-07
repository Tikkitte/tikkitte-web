import Hero from '@/components/landing/Hero'
import AttendeeFeatures from '@/components/landing/AttendeeFeatures'
import OrganizerPitch from '@/components/landing/OrganizerPitch'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-full">
      <Hero />
      <AttendeeFeatures />
      <OrganizerPitch />
      <Footer />
    </main>
  )
}
