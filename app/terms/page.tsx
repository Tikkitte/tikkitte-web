import Nav from '@/components/landing/Nav'
import Footer from '@/components/landing/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Tikkitte',
  description: 'Terms governing use of Tikkitte, operated by FIRSTPASS EVENTS LTD.',
}

export default function TermsPage() {
  return (
    <main className="flex min-h-full flex-col">
      <Nav />

      <div className="bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-12 sm:py-20 lg:px-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6]">
            Legal
          </span>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-lg text-lg text-gray-500">
            Last updated July 8, 2026
          </p>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto max-w-[1440px] px-6 pb-20 lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm leading-relaxed text-gray-600">
              These Terms govern your use of Tikkitte (tikkitte.com), operated by{' '}
              <strong>FIRSTPASS EVENTS LTD</strong>. By creating an account or purchasing a ticket,
              you agree to these Terms.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">Account</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              You are responsible for keeping your login credentials secure and for all activity that
              occurs under your account. If you believe your account has been accessed without
              permission, contact us promptly.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">Tickets and purchases</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Tickets are sold on behalf of event organizers. Refund and exchange policies are set
              per event by the organizer unless an event is cancelled, in which case Tikkitte
              facilitates refunds through its standard process.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">Organizers</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Organizers are responsible for the accuracy of event listings and for delivering the
              event as described. Tikkitte is a ticketing platform and is not the host or producer of
              organizer-run events.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">Prohibited use</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              You may not use Tikkitte for fraud, resell tickets in violation of an organizer&apos;s
              stated policy, attempt to circumvent platform fees, interfere with platform security,
              or use the service in a way that violates applicable law.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">Limitation of liability</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Tikkitte is provided as-is and as available. To the maximum extent permitted by law,
              Tikkitte is not liable for indirect, incidental, special, consequential, or punitive
              damages arising from your use of the service.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">Contact</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Questions about these Terms can be sent to{' '}
              <a href="mailto:admin@tikkitte.com" className="text-[#3B82F6] hover:underline">
                admin@tikkitte.com
              </a>
              . Tikkitte is operated by FIRSTPASS EVENTS LTD.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
