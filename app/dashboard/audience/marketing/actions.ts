'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type SendFanAlertInput = {
  subject: string
  body: string
}

type SendFanAlertResult =
  | { ok: true; sentCount: number }
  | { ok: false; message: string; nextAvailableAt?: string }

export async function sendFanAlert(input: SendFanAlertInput): Promise<SendFanAlertResult> {
  const subject = input.subject.trim()
  const body = input.body.trim()

  if (!subject || !body) {
    return { ok: false, message: 'Subject and message are required.' }
  }
  if (subject.length > 200) {
    return { ok: false, message: 'Subject must be 200 characters or fewer.' }
  }
  if (body.length > 2000) {
    return { ok: false, message: 'Message must be 2000 characters or fewer.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: 'You must be signed in to message fans.' }
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    return { ok: false, message: 'Your session expired. Please sign in again.' }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-fan-alert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ subject, body }),
  })

  const result = await response.json().catch(() => null) as {
    message?: string
    next_available_at?: string
    sent_count?: number
  } | null

  if (!response.ok || typeof result?.sent_count !== 'number') {
    return {
      ok: false,
      message: result?.message ?? 'Failed to send message.',
      nextAvailableAt: result?.next_available_at,
    }
  }

  revalidatePath('/dashboard/audience/marketing')

  return { ok: true, sentCount: result.sent_count }
}
