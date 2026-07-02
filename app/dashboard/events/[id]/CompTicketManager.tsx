'use client'

import { useMemo, useState, useTransition } from 'react'
import type { ComplimentaryTicket, Ticket } from '@/lib/types'
import { sendCompTicket } from './actions'

type Props = {
  eventId: string
  tickets: Ticket[]
  initialCompTickets: ComplimentaryTicket[]
}

const inputClass = 'w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d67ba] placeholder:text-gray-400'

function formatSentAt(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function CompTicketManager({ eventId, tickets, initialCompTickets }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [compTickets, setCompTickets] = useState(initialCompTickets)
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [ticketTypeId, setTicketTypeId] = useState(tickets[0]?.id ?? '')
  const [quantity, setQuantity] = useState('1')
  const [note, setNote] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const ticketMap = useMemo(() => {
    return tickets.reduce((acc: Record<string, Ticket>, ticket) => {
      acc[ticket.id] = ticket
      return acc
    }, {})
  }, [tickets])

  const selectedTicket = ticketTypeId ? ticketMap[ticketTypeId] : null
  const soldOutWarning = selectedTicket?.total_quantity !== null && (selectedTicket?.available_quantity ?? 0) <= 0

  const resetForm = () => {
    setRecipientName('')
    setRecipientEmail('')
    setTicketTypeId(tickets[0]?.id ?? '')
    setQuantity('1')
    setNote('')
  }

  const handleSubmit = () => {
    setError(null)
    setMessage(null)

    startTransition(async () => {
      const result = await sendCompTicket({
        eventId,
        ticketTypeId,
        recipientName,
        recipientEmail,
        quantity: Number(quantity),
        note,
      })

      if (!result.ok) {
        setError(result.message)
        return
      }

      setCompTickets((prev) => [result.compTicket, ...prev])
      resetForm()
      setShowForm(false)
      setIsOpen(true)
      setMessage('Complimentary ticket recorded.')
    })
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-gray-50/70 transition-colors"
        aria-expanded={isOpen}
      >
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">Complimentary tickets</h2>
          <p className="text-xs text-gray-400 mt-1">Send free tickets to guests, partners, or staff.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1d67ba]">
            {compTickets.length}
          </span>
          <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-100 p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {message && <p className="text-sm text-green-600">{message}</p>}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <button
              type="button"
              onClick={() => setShowForm((value) => !value)}
              disabled={tickets.length === 0}
              className="self-start text-sm font-semibold text-[#1d67ba] border border-[#1d67ba] rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-white"
            >
              {showForm ? 'Cancel' : '+ Send complimentary tickets'}
            </button>
          </div>

          {showForm && (
            <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient name</label>
                  <input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className={inputClass}
                    placeholder="Ama Mensah"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient email</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className={inputClass}
                    placeholder="ama@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticket type</label>
                  <select
                    value={ticketTypeId}
                    onChange={(e) => setTicketTypeId(e.target.value)}
                    className={inputClass}
                  >
                    {tickets.map((ticket) => (
                      <option key={ticket.id} value={ticket.id}>{ticket.label}</option>
                    ))}
                  </select>
                  {soldOutWarning && (
                    <p className="mt-2 text-xs text-amber-600">This ticket type is sold out. Complimentary tickets are still allowed.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note <span className="font-normal text-gray-400">(optional)</span></label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={inputClass}
                    placeholder="Guest list, sponsor, artist team"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || tickets.length === 0}
                className="mt-4 bg-[#1d67ba] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1555a0] transition-colors disabled:opacity-60"
              >
                {isPending ? 'Sending...' : 'Send tickets'}
              </button>
            </div>
          )}

          {compTickets.length === 0 ? (
            <p className="text-sm text-gray-400">No complimentary tickets sent yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 pr-4 font-medium text-gray-500">Recipient</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Ticket type</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Qty</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">Sent at</th>
                    <th className="text-left py-3 pl-4 font-medium text-gray-500">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {compTickets.map((compTicket) => (
                    <tr key={compTicket.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 pr-4 font-medium text-gray-900">{compTicket.recipient_name}</td>
                      <td className="py-3 px-4 text-gray-500">{compTicket.recipient_email}</td>
                      <td className="py-3 px-4 text-gray-600">{ticketMap[compTicket.ticket_type_id]?.label ?? '—'}</td>
                      <td className="py-3 px-4 text-right text-gray-900 font-semibold">{compTicket.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-500 text-xs whitespace-nowrap">{formatSentAt(compTicket.sent_at)}</td>
                      <td className="py-3 pl-4 text-gray-500">{compTicket.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
