'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isValidReference } from '@/lib/validation'
import Link from 'next/link'

const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1'

type Props = {
  eventId: string
  reference: string | null
}

export default function ConfirmationContent({ eventId, reference }: Props) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const invalidReference = !reference || !isValidReference(reference)
  const displayError = invalidReference ? 'Invalid or missing payment reference.' : error

  useEffect(() => {
    if (invalidReference) return

    // Warm the ticket route's shell (layout, loading state, client JS) while
    // verification runs, so the redirect below paints the skeleton immediately.
    // For a dynamic route this stops at loading.tsx and does not fetch page
    // data, so it can't cache a not-found result before payment is verified.
    router.prefetch(`/tickets/${reference}`)

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

        // Land straight on the tickets/QR page rather than a separate receipt
        // screen. replace, not push, so the back button doesn't return to
        // this route and re-run verify-payment.
        router.replace(`/tickets/${result.payment.reference}`)
      } catch {
        setError('Unable to verify payment. Please check your connection and try again.')
      }
    }

    verify()
  }, [reference, invalidReference, router])

  if (displayError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
            <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
          </svg>
        </div>
        <h1 className="mb-2 font-anton font-normal text-3xl uppercase text-[#191917]">Payment issue</h1>
        <p className="mb-6 text-[#5F5D54]">{displayError}</p>
        <Link
          href={`/e/${eventId}`}
          className="inline-flex rounded-full bg-[#2565D0] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E56B5]"
        >
          Back to Event
        </Link>
      </div>
    )
  }

  // Loading and post-verification-redirect both show this; there's no
  // separate receipt screen to render on success, verify() above navigates
  // away as soon as it has a reference.
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
