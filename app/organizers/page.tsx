import type { Metadata } from 'next'
import Hero from '@/components/landing/OrganizerHero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import FinalCTA from '@/components/landing/FinalCTA'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Sell Tickets | Tikkitte',
  description: 'List your event on Tikkitte and reach thousands of people looking for things to do in Ghana. Set up in minutes, get paid directly.',
}

export default function OrganizersPage() {
  return (
    <main className="flex min-h-full flex-col bg-[#F4F2EC] font-grotesk">
      <Hero />
      <Features />
      <HowItWorks />
      <FinalCTA headline={<>Your crowd is<br />already here</>} ctaLabel="List your event" ctaHref="https://create.tikkitte.com/signup" size="lg" />
      <Footer />
    </main>
  )
}
