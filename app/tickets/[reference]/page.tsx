import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { isValidReference } from '@/lib/validation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { formatDate } from '@/lib/format'

type Props = {
  params: Promise<{ reference: string }>
}

type TicketRow = {
  id: string
  quantity: number
  qr_code: string | null
  ticket: {
    label: string | null
    price: number | null
  } | null
}

async function getTicketData(reference: string) {
  if (!isValidReference(reference)) return null

  const supabase = await createClient()

  // Look up the payment
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('reference', reference)
    .maybeSingle()

  if (!payment || (payment.status !== 'success' && payment.status !== 'free')) return null

  // Get the user tickets for this payment
  const { data: userTickets } = await supabase
    .from('user_ticket')
    .select('*, ticket:ticket_type_id(label, price)')
    .eq('payment_reference', reference)

  // Get the event
  const { data: event } = await supabase
    .from('event')
    .select('id, slug, name, date, time, venue, image, maps_link')
    .eq('id', payment.event_id)
    .maybeSingle()

  return {
    payment,
    userTickets: userTickets ?? [],
    event,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { reference } = await params
  const data = await getTicketData(reference)
  if (!data?.event) return { title: 'Ticket Not Found | Tikkitte' }
  return {
    title: `Tickets for ${data.event.name} | Tikkitte`,
    robots: 'noindex',
  }
}

export default async function TicketPage({ params }: Props) {
  const { reference } = await params
  const data = await getTicketData(reference)
  if (!data) notFound()

  const { payment, userTickets, event } = data
  const totalAmount = payment.amount ? Number(payment.amount) / 100 : 0
  const metadata = payment.metadata && typeof payment.metadata === 'object'
    ? payment.metadata as Record<string, unknown>
    : {}
  const tableDetails = typeof metadata.table_package_id === 'string'
    ? {
        tableCode: String(metadata.table_code ?? ''),
        tierName: String(metadata.tier_name ?? ''),
        guestCapacity: Number(metadata.guest_capacity ?? 0),
        deposit: Number(metadata.deposit ?? totalAmount),
        minSpend: Number(metadata.min_spend ?? 0),
      }
    : null

  return (
    <div className="min-h-screen bg-[#F4F2EC] font-grotesk text-[#191917]">
      {/* Header */}
      <header className="border-b border-[#E7E2D4] bg-[#F4F2EC]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt=""
              width={42}
              height={28}
              unoptimized
              style={{ width: 'auto', height: '24px' }}
            />
            <Image
              src="/images/text-logo-web.png"
              alt="Tikkitte"
              width={120}
              height={20}
              unoptimized
              style={{ height: '18px', width: 'auto' }}
            />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Event info */}
        {event && (
          <div className="mb-8">
            {event.image?.[0] && (
              <div className="mb-4 overflow-hidden rounded-[24px] border border-[#E4DFD1] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.image[0]}
                  alt={event.name}
                  className="mx-auto aspect-[9/16] w-full max-w-[320px] object-cover"
                />
              </div>
            )}
            <h1 className="mb-2 font-anton font-normal text-[clamp(34px,7vw,54px)] uppercase leading-[1.02] text-[#191917]">{event.name}</h1>
            <div className="flex flex-col gap-1 text-sm text-[#5F5D54]">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span>{formatDate(event.date)}</span>
              </div>
              {event.venue && (
                <div className="flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                  {event.maps_link ? (
                    <a href={event.maps_link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#2565D0]">
                      {event.venue}
                    </a>
                  ) : (
                    <span>{event.venue}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tickets */}
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.16em] text-[#2565D0]">
          Your Tickets
        </h2>

        <div className="space-y-4 mb-8">
          {(userTickets as TicketRow[]).map((ut) => (
            <div
              key={ut.id}
              className="rounded-[24px] border border-[#E4DFD1] bg-white p-5 shadow-[0_18px_50px_rgba(25,25,23,0.06)]"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-[#191917]">
                    {tableDetails ? `Table ${tableDetails.tableCode}` : (ut.ticket?.label ?? 'Ticket')}
                  </p>
                  <p className="text-sm text-[#5F5D54]">
                    {tableDetails ? `One QR · admits ${tableDetails.guestCapacity} guests` : `Qty: ${ut.quantity}`}
                    {!tableDetails && ut.ticket?.price != null && (
                      <span> &middot; {ut.ticket.price === 0 ? 'Free' : `GH₵ ${ut.ticket.price}`}</span>
                    )}
                  </p>
                  {tableDetails && (
                    <div className="mt-3 rounded-xl bg-[#EFFBFE] p-3 text-sm text-[#164E63]">
                      <p className="font-semibold">{tableDetails.tierName}</p>
                      <p>Deposit paid: GHS {tableDetails.deposit.toLocaleString('en-GH')}</p>
                      <p>Minimum spend: GHS {tableDetails.minSpend.toLocaleString('en-GH')}</p>
                    </div>
                  )}
                </div>
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                  Confirmed
                </span>
              </div>

              {/* QR Code */}
              {ut.qr_code && (
                <div className="flex flex-col items-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ut.qr_code}
                    alt="Ticket QR Code"
                    className="h-48 w-48 rounded-xl border border-[#E4DFD1] bg-white"
                  />
                  <p className="mt-2 text-xs text-[#8a887c]">
                    Show this QR code at the entrance
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="mb-8 rounded-[24px] border border-[#E4DFD1] bg-white p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#8a887c]">
            Order Summary
          </h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#5F5D54]">Reference</span>
            <span className="font-mono text-xs text-[#191917]">{reference}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#5F5D54]">Total</span>
            <span className="font-semibold text-[#191917]">
              {totalAmount === 0 ? 'Free' : `GH₵ ${totalAmount.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Back to event link */}
        {event && (
          <Link
            href={`/e/${event.slug ?? event.id}`}
            className="block w-full rounded-full border border-[#C8C3B2] py-3 text-center text-sm font-semibold text-[#191917] transition-colors hover:border-[#191917]"
          >
            View Event
          </Link>
        )}
      </main>

      <footer className="mt-8 border-t border-[#E7E2D4] px-4 py-6">
        <div className="mx-auto max-w-2xl text-center text-xs text-[#8a887c]">
          Powered by Tikkitte &middot; Event Ticketing for Ghana
        </div>
      </footer>
    </div>
  )
}
