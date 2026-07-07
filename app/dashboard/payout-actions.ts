'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type RequestPayoutResult =
  | { ok: true; payoutId: string }
  | { ok: false; message: string }

export async function requestPayout(amount: number): Promise<RequestPayoutResult> {
  if (typeof amount !== 'number' || !Number.isFinite(amount)) {
    return { ok: false, message: 'Enter a valid payout amount.' }
  }

  const roundedAmount = Math.round(amount * 100) / 100
  if (roundedAmount !== amount) {
    return { ok: false, message: 'Amount can only have up to 2 decimal places.' }
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
    body: JSON.stringify({ amount }),
  })

  const result = await response.json().catch(() => null) as { message?: string; payoutId?: string } | null
  if (!response.ok || !result?.payoutId) {
    return { ok: false, message: result?.message ?? 'Failed to request payout.' }
  }

  revalidatePath('/dashboard')
  return { ok: true, payoutId: result.payoutId }
}
