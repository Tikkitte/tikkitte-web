import Nav from '@/components/landing/Nav'
import Footer from '@/components/landing/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Tikkitte',
  description: 'How Tikkitte, operated by FIRSTPASS EVENTS LTD, collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <main className="flex min-h-full flex-col">
      <Nav />

      <div className="bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-12 sm:py-20 lg:px-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6]">
            Legal
          </span>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Privacy Policy
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
              Tikkitte (tikkitte.com) is operated by <strong>FIRSTPASS EVENTS LTD</strong>, a company
              providing event ticketing services in Ghana. This policy explains what information we
              collect when you use Tikkitte to discover, buy, or sell tickets, and how we use it.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">Information we collect</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              When you create an account, buy a ticket, or register as an organizer, we collect
              information such as your name, email address, and payment details necessary to process
              transactions. We also collect basic usage data (pages visited, device/browser type) to
              keep the service reliable and secure.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">How we use it</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              We use your information to create and manage your account, process ticket purchases and
              payouts, send transactional emails (confirmations, verification codes, receipts), and
              prevent fraud. We do not sell your personal information to third parties.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">Payment processing</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Payments are handled by third-party payment processors. Tikkitte does not store full card
              or mobile money credentials on its own servers.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">Data sharing</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              We share the minimum information necessary with event organizers (so they can honor your
              ticket) and with service providers who help us operate Tikkitte (hosting, payments,
              email delivery), under agreements that restrict them from using your data for anything
              else.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">Your rights</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              You can request access to, correction of, or deletion of your personal data by contacting
              us at the address below. We will respond within a reasonable timeframe.
            </p>

            <h2 className="mb-3 mt-10 text-xl font-semibold text-gray-900">Contact</h2>
            <p className="text-sm leading-relaxed text-gray-600">
              Questions about this policy or your data can be sent to{' '}
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
