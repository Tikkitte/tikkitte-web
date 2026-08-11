'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type RequestPayoutResult =
  | { ok: true; payoutId: string }
  | { ok: false; message: string }

export async function requestPayout(eventId: string): Promise<RequestPayoutResult> {
  const normalizedEventId = typeof eventId === 'string' ? eventId.trim() : ''
  if (!normalizedEventId || normalizedEventId.length > 200) {
    return { ok: false, message: 'Choose a valid event.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'You must be signed in to request a payout.' }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return { ok: false, message: 'Your session expired. Please sign in again.' }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/request-payout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ event_id: normalizedEventId }),
  })

  const result = await response.json().catch(() => null) as { message?: string; payoutId?: string } | null
  if (!response.ok || !result?.payoutId) {
    return { ok: false, message: result?.message ?? 'Failed to request payout.' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/events/${normalizedEventId}`)
  return { ok: true, payoutId: result.payoutId }
}
