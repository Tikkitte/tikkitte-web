'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { validateEmail, sanitizeName } from '@/lib/validation'
import type { Ticket } from '@/lib/types'

const MAX_TICKETS_PER_ORDER = 10
const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1'

type Props = {
  eventId: string
  tickets: Ticket[]
  eventName: string
}

export default function EventCheckout({ eventId, tickets, eventName }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(tickets.map((t) => [t.id, 0]))
  )
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalTickets = useMemo(() => Object.values(counts).reduce((s, n) => s + n, 0), [counts])
  const totalPrice = useMemo(
    () => tickets.reduce((s, t) => s + (counts[t.id] ?? 0) * t.price, 0),
    [tickets, counts],
  )

  const increment = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return
    const current = counts[ticketId] ?? 0
    if (totalTickets >= MAX_TICKETS_PER_ORDER) return
    if (ticket.available_quantity !== null && current >= ticket.available_quantity) return
    setCounts((prev) => ({ ...prev, [ticketId]: current + 1 }))
  }

  const decrement = (ticketId: string) => {
    setCounts((prev) => ({ ...prev, [ticketId]: Math.max(0, (prev[ticketId] ?? 0) - 1) }))
  }

  const handleCheckout = async () => {
    if (loading) return
    setError(null)

    const validEmail = validateEmail(email)
    if (!validEmail) {
      setError('Please enter a valid email address.')
      return
    }

    if (totalTickets === 0) {
      setError('Please select at least one ticket.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      // 1. Anonymous auth
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 1: signing in anonymously...')
      const { data: anonData, error: anonErr } = await supabase.auth.signInAnonymously()
      if (anonErr || !anonData.session || !anonData.user) {
        if (process.env.NODE_ENV === 'development') console.error('[checkout] Anonymous auth failed:', anonErr)
        setError(anonErr?.message || 'Unable to start checkout. Please try again.')
        return
      }
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 1 done. User:', anonData.user.id)

      const userId = anonData.user.id
      const accessToken = anonData.session.access_token

      // 2. Attach email to anonymous user metadata
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 2: updating user metadata...')
      const cleanName = sanitizeName(name)
      const { error: updateErr } = await supabase.auth.updateUser({
        data: { email: validEmail, name: cleanName, is_guest: true },
      })
      if (updateErr && process.env.NODE_ENV === 'development') console.error('[checkout] updateUser error:', updateErr)

      // Refresh session so the new metadata is in the token
      const { data: refreshed } = await supabase.auth.refreshSession()
      const freshToken = refreshed?.session?.access_token ?? accessToken
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 2 done, token refreshed')

      // 3. Create user profile
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 3: upserting user profile...')
      const { error: profileErr } = await supabase.from('user_profile').upsert({
        id: userId,
        email: validEmail,
        name: cleanName,
      })
      if (profileErr && process.env.NODE_ENV === 'development') console.error('[checkout] profile upsert error:', profileErr)
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 3 done')

      // 4. Build ticket array matching edge function format (type integer, not UUID)
      const ticketsPayload = tickets
        .filter((t) => (counts[t.id] ?? 0) > 0)
        .map((t) => ({
          type: t.type,
          quantity: counts[t.id],
        }))
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 4: tickets payload:', JSON.stringify(ticketsPayload))

      // 5. Get quote
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 5: fetching quote...')
      const quoteRes = await fetch(`${SUPABASE_FUNCTIONS_URL}/quote-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${freshToken}`,
        },
        body: JSON.stringify({ event_id: eventId, tickets: ticketsPayload }),
      })

      const quoteData = await quoteRes.json()
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 5 response:', quoteRes.status, JSON.stringify(quoteData))
      if (!quoteRes.ok || !quoteData.quote_id) {
        setError(quoteData.message || 'Failed to get price quote. Please try again.')
        return
      }

      // 6. Make payment
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 6: making payment...')
      const callbackUrl = `${window.location.origin}/e/${eventId}/confirmation`
      const makeRes = await fetch(`${SUPABASE_FUNCTIONS_URL}/make-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${freshToken}`,
        },
        body: JSON.stringify({
          event_id: eventId,
          tickets: ticketsPayload,
          quote_id: quoteData.quote_id,
          callback_url: callbackUrl,
        }),
      })

      const paymentData = await makeRes.json()
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 6 response:', makeRes.status, JSON.stringify(paymentData))
      if (!makeRes.ok) {
        setError(paymentData.message || 'Failed to start payment. Please try again.')
        return
      }

      // 7. Handle free tickets
      if (paymentData.free && paymentData.reference) {
        window.location.href = `/e/${eventId}/confirmation?reference=${paymentData.reference}`
        return
      }

      // 8. Redirect to Paystack
      if (paymentData.authorization_url) {
        try {
          const payUrl = new URL(paymentData.authorization_url)
          if (payUrl.hostname !== 'checkout.paystack.com') {
            setError('Unexpected payment redirect. Please try again.')
            return
          }
        } catch {
          setError('Invalid payment URL received.')
          return
        }
        window.location.href = paymentData.authorization_url
        return
      }

      setError('Unexpected response from payment service.')
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('[checkout] Error at step:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const allSoldOut = tickets.every(
    (t) => t.available_quantity !== null && t.available_quantity <= 0,
  )

  if (tickets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No tickets available for this event.
      </div>
    )
  }

  return (
    <div>
      {/* Ticket selection */}
      <h2 className="text-xs font-bold text-[#1d67ba] uppercase tracking-widest mb-4">
        Tickets
      </h2>

      <div className="space-y-3 mb-8">
        {tickets.map((ticket) => {
          const count = counts[ticket.id] ?? 0
          const available = ticket.available_quantity
          const soldOut = available !== null && available <= 0
          const isLow = available !== null && available > 0 && available <= 10
          const atMax =
            (available !== null && count >= available) || totalTickets >= MAX_TICKETS_PER_ORDER

          return (
            <div
              key={ticket.id}
              className={`border rounded-xl p-4 transition-colors ${
                count > 0
                  ? 'bg-blue-50/50 border-[#1d67ba]/30'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-gray-900">{ticket.label}</span>
                  <span className="ml-2 text-gray-600 font-medium">
                    {ticket.price === 0 ? 'Free' : `GHS ${ticket.price}`}
                  </span>
                </div>
                {soldOut && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                    SOLD OUT
                  </span>
                )}
                {isLow && !soldOut && (
                  <span className="text-xs font-semibold text-amber-600">
                    {available} left
                  </span>
                )}
              </div>

              {soldOut ? (
                <div className="text-center py-2 text-sm text-red-500 font-medium">Sold out</div>
              ) : (
                <div className="flex items-center justify-between bg-white rounded-lg px-3 py-1 border border-gray-100">
                  <button
                    type="button"
                    onClick={() => decrement(ticket.id)}
                    className="w-9 h-9 flex items-center justify-center text-lg font-bold text-gray-700 hover:text-[#1d67ba] transition-colors"
                  >
                    &minus;
                  </button>
                  <span className="text-base font-bold text-gray-900 tabular-nums w-8 text-center">
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={() => increment(ticket.id)}
                    disabled={atMax}
                    className="w-9 h-9 flex items-center justify-center text-lg font-bold text-gray-700 hover:text-[#1d67ba] transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Email + name */}
      {totalTickets > 0 && (
        <div className="space-y-3 mb-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              maxLength={254}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d67ba] focus:border-transparent placeholder:text-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Your tickets and QR code will be sent here
            </p>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1">
              Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              maxLength={100}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d67ba] focus:border-transparent placeholder:text-gray-400"
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      {/* Checkout button */}
      <div className="sticky bottom-4">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || totalTickets === 0 || allSoldOut}
          className="w-full py-3.5 rounded-xl font-semibold text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-[#1d67ba] text-white hover:bg-[#1555a0] shadow-sm"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </span>
          ) : totalTickets === 0 ? (
            'Select tickets'
          ) : totalPrice === 0 ? (
            `Claim ${totalTickets} Free Ticket${totalTickets > 1 ? 's' : ''}`
          ) : (
            `Pay GHS ${totalPrice.toFixed(2)} for ${totalTickets} Ticket${totalTickets > 1 ? 's' : ''}`
          )}
        </button>
      </div>
    </div>
  )
}
