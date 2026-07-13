import Nav from '@/components/landing/Nav'
import Footer from '@/components/landing/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy | Tikkitte',
  description: 'When Tikkitte issues refunds for tickets purchased through tikkitte.com.',
}

export default function RefundPolicyPage() {
  return (
    <main className="flex min-h-full flex-col bg-[#F4F2EC] font-grotesk">
      <Nav />

      <div className="bg-[#F4F2EC]">
        <div className="mx-auto max-w-[1440px] px-6 py-12 sm:py-20 lg:px-12">
          <span className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#2565D0]">
            Legal
          </span>
          <h1 className="mt-3 font-anton text-4xl uppercase leading-tight text-[#191917] sm:text-5xl">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-4 max-w-lg text-lg text-[#5F5D54]">
            Last updated July 13, 2026
          </p>
        </div>
      </div>

      <div className="bg-[#F4F2EC]">
        <div className="mx-auto max-w-[1440px] px-6 pb-20 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm leading-relaxed text-[#5F5D54]">
              This policy explains when you&apos;re entitled to a refund for a ticket purchased
              through Tikkitte (tikkitte.com), operated by <strong>FIRSTPASS EVENTS LTD</strong>.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-[#191917]">
              If an organizer cancels an event
            </h2>
            <p className="text-sm leading-relaxed text-[#5F5D54]">
              If an event organizer cancels an event, Tikkitte automatically refunds every ticket
              holder in full, to the original payment method used at checkout, via Paystack. You
              don&apos;t need to request anything &mdash; the refund is initiated as soon as the event
              is marked cancelled, and you&apos;ll receive an email confirming it. Refunds are
              processed by Paystack in up to 10 business days, though the exact timing can depend
              on your bank or mobile money provider.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-[#191917]">
              All other sales are final
            </h2>
            <p className="text-sm leading-relaxed text-[#5F5D54]">
              Outside of an organizer cancelling an event, Tikkitte does not offer refunds or
              exchanges &mdash; including for change of mind, inability to attend, or purchasing the
              wrong ticket type. If an event is postponed or rescheduled rather than cancelled,
              your ticket remains valid for the new date; contact the organizer directly about any
              accommodation they may be willing to make.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-[#191917]">
              Questions about a refund
            </h2>
            <p className="text-sm leading-relaxed text-[#5F5D54]">
              If you were expecting a refund from a cancelled event and haven&apos;t received it
              within 10 business days, contact us at{' '}
              <a href="mailto:admin@tikkitte.com" className="text-[#2565D0] hover:underline">
                admin@tikkitte.com
              </a>{' '}
              or visit our{' '}
              <a href="/contact" className="text-[#2565D0] hover:underline">
                Contact page
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
