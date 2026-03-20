import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-full">
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </main>
  )
}
