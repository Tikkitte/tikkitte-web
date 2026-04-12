import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { isValidReference } from '@/lib/validation'
import Link from 'next/link'
import type { Metadata } from 'next'

type Props = {
  params: Promise<{ reference: string }>
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
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

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-gray-100 dark:border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Tikkitte
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Event info */}
        {event && (
          <div className="mb-8">
            {event.image?.[0] && (
              <div className="rounded-2xl overflow-hidden mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={event.image[0]}
                  alt={event.name}
                  className="w-full max-h-[300px] object-cover"
                />
              </div>
            )}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{event.name}</h1>
            <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-slate-400">
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
                    <a href={event.maps_link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-900 dark:hover:text-white">
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
        <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          Your Tickets
        </h2>

        <div className="space-y-4 mb-8">
          {userTickets.map((ut: any) => (
            <div
              key={ut.id}
              className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {ut.ticket?.label ?? 'Ticket'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Qty: {ut.quantity}
                    {ut.ticket?.price != null && (
                      <span> &middot; {ut.ticket.price === 0 ? 'Free' : `GHS ${ut.ticket.price}`}</span>
                    )}
                  </p>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 px-2.5 py-1 rounded-full">
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
                    className="w-48 h-48 rounded-lg border border-gray-200 dark:border-slate-700"
                  />
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                    Show this QR code at the entrance
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">
            Order Summary
          </h3>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-slate-400">Reference</span>
            <span className="text-gray-900 dark:text-white font-mono text-xs">{reference}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-slate-400">Total</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {totalAmount === 0 ? 'Free' : `GHS ${totalAmount.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* Back to event link */}
        {event && (
          <Link
            href={`/e/${event.slug ?? event.id}`}
            className="block w-full text-center py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            View Event
          </Link>
        )}
      </main>

      <footer className="border-t border-gray-100 dark:border-slate-800 px-4 py-6 mt-8">
        <div className="max-w-2xl mx-auto text-center text-xs text-gray-400 dark:text-slate-500">
          Powered by Tikkitte &middot; Event Ticketing for Ghana
        </div>
      </footer>
    </div>
  )
}
