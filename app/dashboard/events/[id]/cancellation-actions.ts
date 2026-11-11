'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function requestEventCancellation(eventId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  if (typeof eventId !== 'string' || !eventId.trim() || eventId.length > 200) return { ok: false, message: 'Invalid event.' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'You must be signed in.' }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return { ok: false, message: 'Your session expired. Please sign in again.' }
  let response: Response
  try {
    response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/request-event-cancellation`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ event_id: eventId.trim() }),
    })
  } catch {
    // Safe to retry: a repeated request leaves an existing one unchanged.
    return { ok: false, message: 'We couldn’t reach Tikkitte. Check your connection and try again.' }
  }
  if (!response.ok) {
    const result = await response.json().catch(() => null)
    return { ok: false, message: result?.message ?? 'Could not request cancellation. Please try again.' }
  }
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/events/${eventId.trim()}`)
  revalidatePath('/admin/refunds')
  return { ok: true }
}
