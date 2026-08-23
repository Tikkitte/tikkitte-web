'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatSaleDate, saleDateTime, ticketSaleStatus } from '@/lib/ticketAvailability'
import { validateEmail, sanitizeName, suggestEmailDomain } from '@/lib/validation'
import type { PromoCode, Ticket } from '@/lib/types'

const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1'

type Props = {
  eventId: string
  eventSlug: string
  tickets: Ticket[]
}

function promoDescription(promoCode: PromoCode) {
  return promoCode.discount_type === 'percent'
    ? `${promoCode.discount_value}% off`
    : `GH₵ ${promoCode.discount_value} off`
}

export default function EventCheckout({ eventId, eventSlug, tickets }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    Object.fromEntries(tickets.map((t) => [t.id, 0]))
  )
  const [email, setEmail] = useState('')
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null)
  const [promoMessage, setPromoMessage] = useState<string | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [, setSaleClockTick] = useState(0)

  // ticketSaleStatus() reads the wall clock fresh on every call, but nothing
  // otherwise prompts a re-render when a sale window opens or closes while
  // this page is just sitting open — so schedule one for the next boundary
  // (sale_start/sale_end across all tickets), then reschedule for the one
  // after that once it fires.
  useEffect(() => {
    const now = Date.now()
    const boundaries = tickets.flatMap((t) => {
      const times: number[] = []
      if (t.sale_start_date) times.push(saleDateTime(t.sale_start_date, t.sale_start_time).getTime())
      if (t.sale_end_date) times.push(saleDateTime(t.sale_end_date, t.sale_end_time, true).getTime())
      return times
    })
    const nextBoundary = boundaries.filter((t) => t > now).sort((a, b) => a - b)[0]
    if (nextBoundary === undefined) return

    // setTimeout delays above ~24.8 days (2^31-1 ms) overflow its 32-bit
    // internal delay and fire immediately instead — which, with no
    // dependency array here, would reschedule another immediately-firing
    // timeout on every render and spin the tab. Cap each wait well under
    // that limit and let the effect's next run (triggered by the tick
    // below) recompute the remaining time and cap again.
    const MAX_TIMEOUT_MS = 20 * 24 * 60 * 60 * 1000 // 20 days
    const delay = Math.min(nextBoundary - now + 1000, MAX_TIMEOUT_MS)

    const timeout = setTimeout(() => setSaleClockTick((n) => n + 1), delay)
    return () => clearTimeout(timeout)
  })

  const totalTickets = useMemo(() => Object.values(counts).reduce((s, n) => s + n, 0), [counts])
  const totalPrice = useMemo(
    () => tickets.reduce((s, t) => s + (counts[t.id] ?? 0) * t.price, 0),
    [tickets, counts],
  )
  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0
    const eligibleSubtotal = tickets.reduce((sum, ticket) => {
      if (appliedPromo.ticket_type_id && ticket.id !== appliedPromo.ticket_type_id) return sum
      return sum + (counts[ticket.id] ?? 0) * ticket.price
    }, 0)
    if (eligibleSubtotal <= 0) return 0
    const discount = appliedPromo.discount_type === 'percent'
      ? eligibleSubtotal * (appliedPromo.discount_value / 100)
      : appliedPromo.discount_value
    return Math.min(discount, eligibleSubtotal)
  }, [appliedPromo, counts, tickets])
  const displayedTotal = Math.max(0, totalPrice - discountAmount)

  const applyPromoCode = async () => {
    setPromoError(null)
    setPromoMessage(null)
    setAppliedPromo(null)

    const normalizedCode = promoInput.trim().toUpperCase()
    if (!normalizedCode) {
      setPromoError('Enter a promo code.')
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('promo_code')
      .select('*')
      .eq('event_id', eventId)
      .eq('code', normalizedCode)
      .eq('active', true)
      .maybeSingle()

    if (error || !data) {
      setPromoError('Invalid or expired code.')
      return
    }

    const promoCode = data as PromoCode
    if (promoCode.max_uses !== null && promoCode.uses_count >= promoCode.max_uses) {
      setPromoError('This code has been used the maximum number of times.')
      return
    }

    setAppliedPromo(promoCode)
    setPromoMessage(`✓ ${promoCode.code} applied — ${promoDescription(promoCode)}`)
  }

  const increment = (ticketId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId)
    if (!ticket) return
    if (!ticketSaleStatus(ticket).available) return
    const current = counts[ticketId] ?? 0
    if (ticket.available_quantity !== null && current >= ticket.available_quantity) return
    if (ticket.max_per_order !== null && current >= ticket.max_per_order) return
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

    for (const ticket of tickets) {
      const quantity = counts[ticket.id] ?? 0
      if (quantity === 0) continue
      const saleStatus = ticketSaleStatus(ticket)
      if (!saleStatus.available) {
        setError(`${ticket.label} is not currently on sale.`)
        return
      }
      if (quantity < ticket.min_per_order) {
        setError(`${ticket.label} requires at least ${ticket.min_per_order} per order.`)
        return
      }
      if (ticket.max_per_order !== null && quantity > ticket.max_per_order) {
        setError(`${ticket.label} allows a maximum of ${ticket.max_per_order} per order.`)
        return
      }
      if (ticket.available_quantity !== null && quantity > ticket.available_quantity) {
        setError(`Only ${ticket.available_quantity} ${ticket.label} tickets are available.`)
        return
      }
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
        body: JSON.stringify({
          event_id: eventId,
          tickets: ticketsPayload,
          promo_code: appliedPromo?.code ?? null,
        }),
      })

      const quoteData = await quoteRes.json()
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 5 response:', quoteRes.status, JSON.stringify(quoteData))
      if (!quoteRes.ok || !quoteData.quote_id) {
        setError(quoteData.message || 'Failed to get price quote. Please try again.')
        return
      }

      // 6. Make payment
      if (process.env.NODE_ENV === 'development') console.log('[checkout] Step 6: making payment...')
      const callbackUrl = `${window.location.origin}/e/${eventSlug}/confirmation`
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
          promo_code: appliedPromo?.code ?? null,
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
        window.location.href = `/e/${eventSlug}/confirmation?reference=${paymentData.reference}`
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

  // Hide tiers whose sale window hasn't opened yet — only show tickets that
  // are currently on sale or already ended, per organizer feedback that
  // listing future phases ahead of time was confusing buyers.
  const visibleTickets = tickets.filter((t) => !ticketSaleStatus(t).saleStartDate)

  const allUnavailable = visibleTickets.every(
    (t) => !ticketSaleStatus(t).available || (t.available_quantity !== null && t.available_quantity <= 0),
  )

  // Earliest upcoming sale start among the hidden future tiers, if any — used
  // both for the fully-hidden empty state and the between-phases hint below,
  // so a buyer who lands while every visible tier is ended still learns
  // another phase is coming instead of just seeing a dead "Sales ended".
  const nextSaleStart = tickets
    .map((t) => ticketSaleStatus(t).saleStartDate)
    .filter((d): d is string => !!d)
    .sort()[0]

  if (tickets.length === 0) {
    return (
      <div className="py-8 text-center text-[#8a887c]">
        No tickets available for this event.
      </div>
    )
  }

  if (visibleTickets.length === 0) {
    return (
      <div className="py-8 text-center text-[#8a887c]">
        {nextSaleStart ? `Ticket sales open ${formatSaleDate(nextSaleStart, null)}.` : 'Ticket sales are not currently open.'}
      </div>
    )
  }

  return (
    <div>
      {/* Ticket selection */}
      <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#2565D0]">
        Tickets
      </h2>

      <div className="space-y-3 mb-8">
        {visibleTickets.map((ticket) => {
          const count = counts[ticket.id] ?? 0
          const available = ticket.available_quantity
          const soldOut = available !== null && available <= 0
          const saleStatus = ticketSaleStatus(ticket)
          const unavailable = soldOut || !saleStatus.available
          const isLow = available !== null && available > 0 && available <= 10
          const atMax =
            (available !== null && count >= available) ||
            (ticket.max_per_order !== null && count >= ticket.max_per_order)

          return (
            <div
              key={ticket.id}
              className={`border rounded-xl p-4 transition-colors ${
                unavailable
                  ? 'border-[#E4DFD1] bg-[#F4F2EC] opacity-70'
                  : count > 0
                  ? 'border-[#2565D0]/35 bg-[#2565D0]/5'
                  : 'border-[#E4DFD1] bg-[#F4F2EC]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-bold text-[#191917]">{ticket.label}</span>
                  <span className="ml-2 font-medium text-[#5F5D54]">
                    {ticket.price === 0 ? 'Free' : `GH₵ ${ticket.price}`}
                  </span>
                </div>
                {soldOut && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                    SOLD OUT
                  </span>
                )}
                {isLow && !unavailable && (
                  <span className="text-xs font-semibold text-amber-600">
                    {available} left
                  </span>
                )}
              </div>

              {soldOut ? (
                <div className="py-2 text-center text-sm font-medium text-red-500">
                  Sold out
                </div>
              ) : unavailable ? (
                <div className="flex items-center justify-center rounded-lg border border-[#E7E2D4] bg-white px-3 py-2 text-center text-sm font-medium text-[#5F5D54]">
                  {saleStatus.label}
                </div>
              ) : (
                <>
                  {(ticket.min_per_order > 1 || ticket.max_per_order !== null) && (
                    <p className="mb-2 text-xs text-[#8a887c]">
                      {ticket.min_per_order > 1 ? `Min ${ticket.min_per_order}` : 'Min 1'}
                      {ticket.max_per_order !== null ? ` · Max ${ticket.max_per_order}` : ''}
                    </p>
                  )}
                  <div className="flex items-center justify-between rounded-lg border border-[#E7E2D4] bg-white px-3 py-1">
                    <button
                      type="button"
                      onClick={() => decrement(ticket.id)}
                      className="flex h-9 w-9 items-center justify-center text-lg font-bold text-[#5F5D54] transition-colors hover:text-[#2565D0]"
                    >
                      &minus;
                    </button>
                    <span className="w-8 text-center text-base font-bold tabular-nums text-[#191917]">
                      {count}
                    </span>
                    <button
                      type="button"
                      onClick={() => increment(ticket.id)}
                      disabled={atMax}
                      className="flex h-9 w-9 items-center justify-center text-lg font-bold text-[#5F5D54] transition-colors hover:text-[#2565D0] disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Between-phases hint: every visible tier is ended/sold out, but
          another tier opens later — say so instead of leaving a dead end. */}
      {allUnavailable && nextSaleStart && (
        <p className="-mt-6 mb-8 text-sm text-[#5F5D54]">
          More tickets go on sale {formatSaleDate(nextSaleStart, null)}.
        </p>
      )}

      {/* Email + name */}
      {totalTickets > 0 && (
        <div className="space-y-3 mb-6">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold text-[#191917]">
              Email address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              maxLength={254}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailSuggestion(null)
              }}
              onBlur={() => setEmailSuggestion(suggestEmailDomain(email))}
              className="w-full rounded-lg border border-[#E4DFD1] bg-white px-4 py-2.5 text-sm text-[#191917] placeholder:text-[#8a887c] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2565D0]"
            />
            {emailSuggestion ? (
              <p className="mt-1 text-xs text-[#2565D0]">
                Did you mean{' '}
                <button
                  type="button"
                  onClick={() => {
                    setEmail(emailSuggestion)
                    setEmailSuggestion(null)
                  }}
                  className="font-semibold underline underline-offset-2"
                >
                  {emailSuggestion}
                </button>
                ?
              </p>
            ) : (
              <p className="mt-1 text-xs text-[#8a887c]">
                Your tickets and QR code will be sent here
              </p>
            )}
          </div>
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-semibold text-[#191917]">
              Name <span className="font-normal text-[#8a887c]">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              maxLength={100}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#E4DFD1] bg-white px-4 py-2.5 text-sm text-[#191917] placeholder:text-[#8a887c] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2565D0]"
            />
          </div>
        </div>
      )}

      {/* Promo code */}
      {totalTickets > 0 && (
        <div className="mb-6">
          <label htmlFor="promo-code" className="mb-1 block text-sm font-semibold text-[#191917]">
            Promo code
          </label>
          <div className="flex gap-2">
            <input
              id="promo-code"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              className="min-w-0 flex-1 rounded-lg border border-[#E4DFD1] bg-white px-4 py-2.5 text-sm text-[#191917] placeholder:text-[#8a887c] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#2565D0]"
              placeholder="Enter promo code"
            />
            <button
              type="button"
              onClick={applyPromoCode}
              className="rounded-lg border border-[#2565D0] px-4 py-2.5 text-sm font-semibold text-[#2565D0] transition-colors hover:bg-[#2565D0]/5"
            >
              Apply
            </button>
          </div>
          {promoMessage && <p className="mt-2 text-sm font-medium text-green-700">{promoMessage}</p>}
          {promoError && <p className="mt-2 text-sm font-medium text-red-600">{promoError}</p>}
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
        {totalTickets > 0 && discountAmount > 0 && (
          <div className="mb-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm">
            <div className="flex justify-between text-[#5F5D54]">
              <span>Subtotal</span>
              <span>GH₵ {totalPrice.toFixed(2)}</span>
            </div>
            <div className="mt-1 flex justify-between font-semibold text-green-700">
              <span>Discount</span>
              <span>-GH₵ {discountAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || totalTickets === 0 || allUnavailable}
          className="w-full rounded-xl bg-[#2565D0] py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:bg-[#1E56B5] disabled:cursor-not-allowed disabled:opacity-40"
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
          ) : displayedTotal === 0 ? (
            `Claim ${totalTickets} Free Ticket${totalTickets > 1 ? 's' : ''}`
          ) : (
            `Pay GH₵ ${displayedTotal.toFixed(2)} for ${totalTickets} Ticket${totalTickets > 1 ? 's' : ''}`
          )}
        </button>
      </div>
    </div>
  )
}
