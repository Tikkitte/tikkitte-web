'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ApproveOrganizerResult = { ok: true } | { ok: false; message: string }
type SetOrganizerFeeResult = { ok: true } | { ok: false; message: string }

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function approveOrganizer(organizerId: string): Promise<ApproveOrganizerResult> {
  if (!uuidPattern.test(organizerId)) {
    return { ok: false, message: 'Invalid organizer.' }
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

  const { error } = await supabase.rpc('approve_organizer', { target_organizer_id: organizerId })
  if (error) return { ok: false, message: 'Failed to approve organizer.' }

  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    try {
      const emailRes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-organizer-approved`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ organizer_id: organizerId }),
      })
      if (!emailRes.ok) {
        console.error('[approveOrganizer] send-organizer-approved failed', emailRes.status, await emailRes.text())
      }
    } catch (err) {
      console.error('[approveOrganizer] send-organizer-approved invoke failed', err)
    }
  }

  revalidatePath('/admin/organizers')
  return { ok: true }
}

export async function setOrganizerFee(organizerId: string, feePercent: number | null): Promise<SetOrganizerFeeResult> {
  if (!uuidPattern.test(organizerId)) {
    return { ok: false, message: 'Invalid organizer.' }
  }
  if (feePercent !== null && (!Number.isFinite(feePercent) || feePercent < 0 || feePercent > 100)) {
    return { ok: false, message: 'Fee must be between 0 and 100.' }
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

  const { error } = await supabase.rpc('admin_set_organizer_fee', {
    target_organizer_id: organizerId,
    fee_percent: feePercent,
  })
  if (error) return { ok: false, message: 'Failed to update fee.' }

  revalidatePath('/admin/organizers')
  return { ok: true }
}
