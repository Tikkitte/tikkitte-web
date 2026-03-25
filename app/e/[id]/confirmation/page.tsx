'use client'

import { useEffect, useState, use } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isValidReference } from '@/lib/validation'
import Link from 'next/link'

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

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: eventId } = use(params)
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference') || searchParams.get('trxref')

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
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ reference }),
        })

        const result = await res.json()

        if (!res.ok || result.status !== 'success') {
          setError(result.message || 'Payment verification failed. Please try again.')
          return
        }

        setData(result as ConfirmationData)

        // Fire-and-forget: send ticket email
        try {
          const email =
            session?.session?.user?.user_metadata?.email ||
            session?.session?.user?.email
          if (email) {
            fetch(`${SUPABASE_FUNCTIONS_URL}/send-ticket-email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
              },
              body: JSON.stringify({ reference, email }),
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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 text-gray-500 dark:text-slate-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
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
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 dark:bg-red-950 mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Issue</h1>
        <p className="text-gray-500 dark:text-slate-400 mb-6">{error}</p>
        <Link
          href={`/e/${eventId}`}
          className="inline-flex px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-slate-100 transition-colors"
        >
          Back to Event
        </Link>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-950 mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
            <circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Tickets Confirmed!</h1>
        <p className="text-gray-500 dark:text-slate-400">
          Your tickets have been sent to your email
        </p>
      </div>

      {/* Event card */}
      {data.event && (
        <div className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden mb-6">
          {data.event.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.event.image} alt={data.event.name} className="w-full h-48 object-cover" />
          )}
          <div className="p-5">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{data.event.name}</h2>
            <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-slate-400">
              {data.event.date && <span>{formatDate(data.event.date)}</span>}
              {data.event.venue && <span>{data.event.venue}</span>}
            </div>
          </div>
        </div>
      )}

      {/* Order summary */}
      <div className="bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500 dark:text-slate-400">Tickets</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {data.tickets_issued} ticket{data.tickets_issued > 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-slate-400">Total paid</span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
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
          className="block w-full text-center py-3 bg-gray-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-semibold text-sm hover:bg-gray-800 dark:hover:bg-slate-100 transition-colors"
        >
          View Tickets &amp; QR Code
        </Link>

        <Link
          href={`/e/${eventId}`}
          className="block w-full text-center py-3 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
        >
          Back to Event
        </Link>
      </div>

      {/* Bookmark prompt */}
      <p className="text-center text-xs text-gray-400 dark:text-slate-500 mt-6">
        Bookmark this page or check your email to access your tickets anytime
      </p>
    </div>
  )
}
