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
    <main className="flex flex-col min-h-full">
      <Nav />

      {/* Page header */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-12 sm:py-20">
          <span className="text-xs font-semibold tracking-widest text-[#3B82F6] uppercase">
            Our story
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            About Tikkitte
          </h1>
          <p className="mt-4 text-lg text-gray-500 max-w-lg">
            Built in Ghana, for Ghana. We&apos;re making it easier to discover, buy, and sell tickets to live events.
          </p>
        </div>
      </div>

      <AboutUs />

      <Footer />
    </main>
  )
}
