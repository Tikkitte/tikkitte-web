// DORMANT — not imported anywhere. This is the original Paystack-backed
// table checkout form, kept here in case in-app payment for table
// reservations gets reconnected later (see FloorPlanPicker.tsx, which now
// renders TableContact.tsx instead). The matching backend (claim_table_for_payment,
// release_expired_table_payment, and the table_package_id branches in
// make-payment/quote-payment/verify-payment/paystack-webhook/reconcile-stuck-payments)
// is likewise still intact and unused.
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sanitizeName, validateEmail } from '@/lib/validation'
import type { TablePackage } from '@/lib/types'

const FUNCTIONS_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`

type Props = {
  eventId: string
  eventSlug: string
  table: TablePackage
  onUnavailable: () => void
}

export default function TableCheckout({ eventId, eventSlug, table, onUnavailable }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkout = async () => {
    if (loading) return
    setError(null)
    const validEmail = validateEmail(email)
    const cleanName = sanitizeName(name)
    const cleanPhone = phone.trim()
    if (!cleanName) return setError('Please enter your name.')
    if (!validEmail) return setError('Please enter a valid email address.')
    if (!/^\+?[0-9 ()-]{7,20}$/.test(cleanPhone)) return setError('Please enter a valid phone number.')

    setLoading(true)
    try {
      const supabase = createClient()
      const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
      if (anonError || !anonData.session || !anonData.user) {
        setError(anonError?.message || 'Unable to start checkout. Please try again.')
        return
      }

      await supabase.auth.updateUser({
        data: { email: validEmail, name: cleanName, phone_number: cleanPhone, is_guest: true },
      })
      const { data: refreshed } = await supabase.auth.refreshSession()
      const accessToken = refreshed.session?.access_token ?? anonData.session.access_token
      const { error: profileError } = await supabase.from('user_profile').upsert({
        id: anonData.user.id,
        email: validEmail,
        name: cleanName,
        phone_number: cleanPhone,
      })
      if (profileError) {
        setError('Unable to save your checkout details. Please try again.')
        return
      }

      const quoteResponse = await fetch(`${FUNCTIONS_URL}/quote-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ event_id: eventId, table_package_id: table.id }),
      })
      const quote = await quoteResponse.json()
      if (!quoteResponse.ok || !quote.quote_id) {
        if (quoteResponse.status === 409) onUnavailable()
        setError(quote.message || 'Unable to price this table. Please choose it again.')
        return
      }

      const callbackUrl = `${window.location.origin}/e/${eventSlug}/confirmation`
      const paymentResponse = await fetch(`${FUNCTIONS_URL}/make-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          event_id: eventId,
          table_package_id: table.id,
          quote_id: quote.quote_id,
          callback_url: callbackUrl,
        }),
      })
      const payment = await paymentResponse.json()
      if (!paymentResponse.ok) {
        if (paymentResponse.status === 409 || payment.code === 'ERR_TABLE_UNAVAILABLE') onUnavailable()
        setError(payment.message || 'Unable to start payment. Please try again.')
        return
      }

      if (!payment.authorization_url) {
        setError('Payment provider did not return a checkout link.')
        return
      }
      const paymentUrl = new URL(payment.authorization_url)
      if (paymentUrl.hostname !== 'checkout.paystack.com') {
        setError('Unexpected payment redirect. Please try again.')
        return
      }
      window.location.href = paymentUrl.toString()
    } catch {
      setError('Unable to start payment. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-xl border border-[rgba(23,17,14,0.14)] bg-[#F6F4EF] px-4 py-3 text-sm text-[#17110E] outline-none placeholder:text-[rgba(23,17,14,0.35)] focus:border-[#1596B7]'

  return (
    <div className="mt-5 border-t border-[rgba(23,17,14,0.12)] pt-5">
      <h3 className="text-sm font-semibold text-[#17110E]">Your details</h3>
      <div className="mt-3 grid gap-3">
        <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" autoComplete="name" />
        <input className={inputClass} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" type="email" autoComplete="email" />
        <input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" type="tel" autoComplete="tel" />
      </div>
      {error && <p className="mt-3 text-sm text-[#c9503d]">{error}</p>}
      <button type="button" onClick={checkout} disabled={loading} className="mt-4 w-full rounded-full bg-[#1596B7] px-5 py-3.5 text-sm font-bold text-[#FDFCFA] transition-opacity hover:opacity-90 disabled:opacity-50">
        {loading ? 'Starting secure payment…' : `Pay GHS ${Number(table.deposit).toLocaleString('en-GH')} deposit`}
      </button>
    </div>
  )
}
