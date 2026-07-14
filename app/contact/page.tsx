import Nav from '@/components/landing/Nav'
import Footer from '@/components/landing/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | Tikkitte',
  description: 'Get in touch with the Tikkitte team.',
}

export default function ContactPage() {
  return (
    <main className="flex min-h-full flex-col bg-[#F4F2EC] font-grotesk">
      <Nav />

      <div className="bg-[#F4F2EC]">
        <div className="mx-auto max-w-[1440px] px-6 py-12 sm:py-20 lg:px-12">
          <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#2565D0]">
            Get in touch
          </span>
          <h1 className="mt-3 font-anton font-normal text-4xl uppercase leading-tight text-[#191917] sm:text-5xl">
            Contact us
          </h1>
          <p className="mt-4 max-w-lg text-lg text-[#5F5D54]">
            Questions about an order, a refund, or your event listing &mdash; we&apos;re happy to help.
          </p>
        </div>
      </div>

      <div className="bg-[#F4F2EC]">
        <div className="mx-auto max-w-[1440px] px-6 pb-20 lg:px-12">
          <div className="max-w-2xl space-y-8">
            <div>
              <h2 className="mb-2 text-xl font-semibold text-[#191917]">General support</h2>
              <p className="text-sm leading-relaxed text-[#5F5D54]">
                For ticket, refund, or account questions, email{' '}
                <a href="mailto:admin@tikkitte.com" className="text-[#2565D0] hover:underline">
                  admin@tikkitte.com
                </a>
                . We aim to respond within 1&ndash;2 business days.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold text-[#191917]">Event-specific questions</h2>
              <p className="text-sm leading-relaxed text-[#5F5D54]">
                For questions about a specific event &mdash; schedule, venue, accessibility &mdash; contact
                the organizer listed on the event page. Tikkitte is the ticketing platform; the
                organizer runs the event.
              </p>
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold text-[#191917]">Business</h2>
              <p className="text-sm leading-relaxed text-[#5F5D54]">
                Tikkitte is operated by <strong>FIRSTPASS EVENTS LTD</strong>.
              </p>
              <address className="mt-2 text-sm leading-relaxed text-[#5F5D54] not-italic">
                GZ-150-7297<br />
                House Number 7, Russel Street<br />
                Near Ghana International Mall, Spintex<br />
                Ledzokuku, Accra<br />
                Greater Accra, Ghana
              </address>
              <p className="mt-3 text-sm leading-relaxed text-[#5F5D54]">
                Phone:{' '}
                <a href="tel:+233539511236" className="text-[#2565D0] hover:underline">
                  +233 53 951 1236
                </a>
                {' '}or{' '}
                <a href="tel:+233267987076" className="text-[#2565D0] hover:underline">
                  +233 26 798 7076
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
