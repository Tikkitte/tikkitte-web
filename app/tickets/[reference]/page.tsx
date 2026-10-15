import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { isValidReference } from '@/lib/validation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { formatDate } from '@/lib/format'
import TicketQrCode from './TicketQrCode'

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

type EventRow = {
  id: string
  slug: string | null
  name: string
  date: string
  time: string | null
  venue: string | null
  image: string[] | null
  maps_link: string | null
}

type PaymentRow = {
  status: string
  amount: number | null
  service_fee_cents: number | null
  metadata: unknown
  // The legacy email copy stays dormant; payments has no email column.
  email?: never
  event: EventRow | null
}

// Cached per request so generateMetadata and the page share one fetch.
const getTicketData = cache(async (reference: string) => {
  if (!isValidReference(reference)) return null

  const supabase = await createClient()

  // Both lookups only need the reference, so they run in parallel. The event
  // comes back embedded through payments.event_id.
  const [paymentResult, ticketsResult] = await Promise.all([
    supabase
      .from('payments')
      .select('status, amount, service_fee_cents, metadata, event:event_id(id, slug, name, date, time, venue, image, maps_link)')
      .eq('reference', reference)
      .maybeSingle()
      .overrideTypes<PaymentRow, { merge: false }>(),
    supabase
      .from('user_ticket')
      .select('id, quantity, qr_code, ticket:ticket_type_id(label, price)')
      .eq('payment_reference', reference)
      .overrideTypes<TicketRow[], { merge: false }>(),
  ])

  if (paymentResult.error) {
    console.error('[ticket-page] failed to load payment:', paymentResult.error.message)
  }
  if (ticketsResult.error) {
    console.error('[ticket-page] failed to load tickets:', ticketsResult.error.message)
  }

  const payment = paymentResult.data
  if (!payment || (payment.status !== 'success' && payment.status !== 'free')) return null

  return {
    payment,
    userTickets: ticketsResult.data ?? [],
    event: payment.event,
  }
})

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
  const serviceFeeAmount = Number(payment.service_fee_cents ?? 0) / 100
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
    <main className="mx-auto max-w-2xl px-4 py-8">
      {payment.email && (
        <p className="mb-6 rounded-xl border border-[#E4DFD1] bg-white px-4 py-3 text-center text-sm text-[#5F5D54]">
          A copy has also been sent to <span className="font-semibold text-[#191917]">{payment.email}</span>
        </p>
      )}

      {/* Event info */}
      {event && (
        <div className="mb-8">
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
      <h2 className="mb-1 text-sm font-bold uppercase tracking-[0.16em] text-[#2565D0]">
        Your Tickets
      </h2>
      <p className="mb-4 text-xs text-[#8a887c]">
        Screenshot or save each QR code below so it&apos;s on hand even offline.
      </p>

      <div className="space-y-4 mb-8">
        {userTickets.map((ut) => (
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
            <TicketQrCode ticketId={ut.id} initialQrCode={ut.qr_code} />
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div className="mb-8 rounded-[24px] border border-[#E4DFD1] bg-white p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.16em] text-[#8a887c]">
          Order Summary
        </h3>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-[#5F5D54]">Tickets</span>
          <span className="font-semibold text-[#191917]">
            {userTickets.length} ticket{userTickets.length === 1 ? '' : 's'}
          </span>
        </div>
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
        {serviceFeeAmount > 0 && (
          <p className="mt-1 text-right text-xs text-[#8a887c]">
            Includes GH₵ {serviceFeeAmount.toFixed(2)} service fee
          </p>
        )}
      </div>

      {event?.image?.[0] && (
        <div className="mb-8 overflow-hidden rounded-[24px] border border-[#E4DFD1] bg-white">
          <Image
            src={event.image[0]}
            alt={event.name}
            width={320}
            height={569}
            sizes="320px"
            quality={75}
            className="mx-auto aspect-[9/16] h-auto w-full max-w-[320px] object-cover"
          />
        </div>
      )}

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
  )
}
