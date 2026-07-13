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
