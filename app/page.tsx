import Hero from '@/components/landing/Hero'
import PhoneCarousel from '@/components/landing/PhoneCarousel'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-full">
      <Hero />
      <PhoneCarousel />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  )
}
