'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type RetryResult = { ok: true } | { ok: false; message: string }

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function retryEventRefunds(eventId: string): Promise<RetryResult> {
  if (!uuidPattern.test(eventId)) {
    return { ok: false, message: 'Invalid event.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'You must be signed in.' }

  const { data: adminRow } = await supabase
    .from('admin_user')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) return { ok: false, message: 'Not authorized.' }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return { ok: false, message: 'Session expired.' }

  const functionsBaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!functionsBaseUrl) return { ok: false, message: 'Supabase URL is not configured.' }

  const res = await fetch(`${functionsBaseUrl}/functions/v1/refund-cancelled-event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ event_id: eventId }),
  })

  if (!res.ok) {
    const message = await res.text().catch(() => '')
    return { ok: false, message: message || `Retry failed (HTTP ${res.status}).` }
  }

  revalidatePath('/admin/refunds')
  return { ok: true }
}

export async function reviewEventCancellation(eventId: string, decision: 'approve' | 'decline'): Promise<RetryResult> {
  if (typeof eventId !== 'string' || !eventId.trim() || eventId.length > 200 || !['approve', 'decline'].includes(decision)) {
    return { ok: false, message: 'Invalid cancellation request.' }
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'You must be signed in.' }
  const { data: admin } = await supabase.from('admin_user').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!admin) return { ok: false, message: 'Not authorized.' }
  const rpc = decision === 'approve' ? 'admin_approve_event_cancellation' : 'admin_decline_event_cancellation'
  const { error } = await supabase.rpc(rpc, { p_event_id: eventId.trim() })
  if (error) {
    return { ok: false, message: error.message.includes('pending payout') ? 'Resolve the pending payout first.'
      : error.message.includes('already cancelled') ? 'This event is already cancelled.'
      : error.message.includes('no open cancellation') ? 'This request is no longer open. Refresh the page.'
      : 'Could not review this cancellation. Please try again.' }
  }
  revalidatePath('/admin/refunds')
  revalidatePath('/admin/events')
  revalidatePath('/admin/payouts')
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/events/${eventId.trim()}`)
  revalidatePath('/e', 'layout')
  return { ok: true }
}
