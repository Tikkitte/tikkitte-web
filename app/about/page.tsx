import Nav from '@/components/landing/Nav'
import AboutUs from '@/components/landing/AboutUs'
import Footer from '@/components/landing/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Tikkitte',
  description: 'Meet the team behind Tikkitte — Ghana\'s home for live event ticketing.',
}

export default function AboutPage() {
  return (
    <main className="flex min-h-full flex-col bg-[#F4F2EC] font-grotesk">
      <Nav />

      {/* Page header */}
      <div className="bg-[#F4F2EC]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 sm:py-20">
          <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#2565D0]">
            Our story
          </span>
          <h1 className="mt-3 font-anton text-4xl uppercase leading-tight text-[#191917] sm:text-5xl">
            About Tikkitte
          </h1>
          <p className="mt-4 max-w-lg text-lg text-[#5F5D54]">
            Built in Ghana, for Ghana. We&apos;re making it easier to discover, buy, and sell tickets to live events.
          </p>
        </div>
      </div>

      <AboutUs />

      <Footer />
    </main>
  )
}
