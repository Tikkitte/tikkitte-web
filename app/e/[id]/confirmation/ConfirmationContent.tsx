'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isValidReference } from '@/lib/validation'
import Link from 'next/link'
import { formatDate } from '@/lib/format'

const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1'

type ConfirmationData = {
  status: string
  event: {
    id: string
    name: string
    image: string | null
    date: string | null
    venue: string | null
  } | null
  breakdown: {
    total: number
    currency: string
  }
  tickets_issued: number
  payment: {
    reference: string
  }
}

type Props = {
  eventId: string
  reference: string | null
}

export default function ConfirmationContent({ eventId, reference }: Props) {
  const [data, setData] = useState<ConfirmationData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!reference || !isValidReference(reference)) {
      setError('Invalid or missing payment reference.')
      setLoading(false)
      return
    }

    const verify = async () => {
      try {
        const supabase = createClient()
        const { data: session } = await supabase.auth.getSession()
        const accessToken = session?.session?.access_token

        const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ reference }),
        })

        const result = await res.json()

        if (!res.ok || result.status !== 'success') {
          setError(result.message || 'Payment verification failed. Please try again.')
          return
        }

        setData(result as ConfirmationData)

        // Fire-and-forget: send ticket email (requires auth)
        try {
          if (accessToken) {
            fetch(`${SUPABASE_FUNCTIONS_URL}/send-ticket-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({ reference }),
            }).catch(() => {})
          }
        } catch {
          // non-critical
        }
      } catch {
        setError('Unable to verify payment. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [reference])

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 font-medium text-[#5F5D54]">
          <svg className="h-5 w-5 animate-spin text-[#2565D0]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Verifying your payment...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
          </svg>
        </div>
        <h1 className="mb-2 font-anton text-3xl uppercase text-[#191917]">Payment issue</h1>
        <p className="mb-6 text-[#5F5D54]">{error}</p>
        <Link
          href={`/e/${eventId}`}
          className="inline-flex rounded-full bg-[#2565D0] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E56B5]"
        >
          Back to Event
        </Link>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* Success header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <h1 className="mb-1 font-anton text-4xl uppercase tracking-normal text-[#191917]">Tickets confirmed</h1>
        <p className="text-[#5F5D54]">
          Your tickets have been sent to your email
        </p>
      </div>

      {/* Event card */}
      {data.event && (
        <div className="mb-6 overflow-hidden rounded-[24px] border border-[#E4DFD1] bg-white">
          {data.event.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.event.image} alt={data.event.name} className="w-full h-48 object-cover" />
          )}
          <div className="p-5">
            <h2 className="mb-1 font-anton text-2xl uppercase leading-tight text-[#191917]">{data.event.name}</h2>
            <div className="flex flex-col gap-1 text-sm text-[#5F5D54]">
              {data.event.date && <span>{formatDate(data.event.date)}</span>}
              {data.event.venue && <span>{data.event.venue}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Order summary */}
      <div className="mb-6 rounded-[20px] border border-[#E4DFD1] bg-white p-5">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-[#5F5D54]">Tickets</span>
          <span className="text-sm font-semibold text-[#191917]">
            {data.tickets_issued} ticket{data.tickets_issued > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#5F5D54]">Total paid</span>
          <span className="text-sm font-semibold text-[#191917]">
            {data.breakdown.total === 0
              ? 'Free'
              : `${data.breakdown.currency} ${data.breakdown.total.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href={`/tickets/${data.payment.reference}`}
          className="block w-full rounded-full bg-[#2565D0] py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#1E56B5]"
        >
          View Tickets &amp; QR Code
        </Link>

        <Link
          href={`/e/${eventId}`}
          className="block w-full rounded-full border border-[#C8C3B2] py-3 text-center text-sm font-semibold text-[#191917] transition-colors hover:border-[#191917]"
        >
          Back to Event
        </Link>
      </div>

      {/* Bookmark prompt */}
      <p className="mt-6 text-center text-xs text-[#8a887c]">
        Bookmark this page or check your email to access your tickets anytime
      </p>

      {/* Browse more */}
      <div className="mt-8 border-t border-[#E7E2D4] pt-6 text-center">
        <Link
          href="/"
          className="text-sm font-semibold text-[#2565D0] hover:underline"
        >
          &larr; Browse more events
        </Link>
      </div>
    </div>
  )
}
