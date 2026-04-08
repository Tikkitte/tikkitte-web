import type { Metadata } from 'next'
import Hero from '@/components/landing/OrganizerHero'
import PhoneCarousel from '@/components/landing/PhoneCarousel'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Footer from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Sell Tickets | Tikkitte',
  description: 'List your event on Tikkitte and reach thousands of people looking for things to do in Ghana. Set up in minutes, get paid directly.',
}

export default function OrganizersPage() {
  return (
    <main className="flex flex-col min-h-full">
      <Hero />
      <section className="bg-white py-14 sm:py-24">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 flex justify-center">
          <PhoneCarousel />
        </div>
      </section>
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  )
}
