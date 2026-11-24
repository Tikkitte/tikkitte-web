'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ApproveOrganizerResult = { ok: true; emailSent: boolean } | { ok: false; message: string }
type SetOrganizerFeeResult = { ok: true } | { ok: false; message: string }

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function approveOrganizer(organizerId: string, platformFee: number | null, serviceFee: number | null): Promise<ApproveOrganizerResult> {
  if (!uuidPattern.test(organizerId)) {
    return { ok: false, message: 'Invalid organizer.' }
  }

  if (platformFee !== null && (!Number.isFinite(platformFee) || platformFee < 0 || platformFee > 100)) return { ok: false, message: 'Platform fee must be between 0 and 100%.' }
  if (serviceFee !== null && (!Number.isFinite(serviceFee) || serviceFee < 0 || serviceFee > 10 || Math.abs(serviceFee * 100 - Math.round(serviceFee * 100)) > 1e-9)) return { ok: false, message: 'Service fee must be between 0 and 10%, in steps of 0.01.' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'You must be signed in.' }

  const { data: adminRow } = await supabase
    .from('admin_user')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) return { ok: false, message: 'Not authorized.' }

  const { error } = await supabase.rpc('admin_approve_organizer', { target_organizer_id: organizerId, p_platform_fee_percent: platformFee, p_service_fee_percent: serviceFee })
  if (error) return { ok: false, message: 'Failed to approve organizer.' }

  const emailSent = await sendDecisionEmail(supabase, organizerId, 'approved', '')
  revalidatePath('/admin/organizers')
  return { ok: true, emailSent }
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

export async function setOrganizerServiceFee(organizerId: string, feePercent: number | null): Promise<SetOrganizerFeeResult> {
  if (!uuidPattern.test(organizerId)) {
    return { ok: false, message: 'Invalid organizer.' }
  }
  if (feePercent !== null && (!Number.isFinite(feePercent) || feePercent < 0 || feePercent > 10 || Math.abs(feePercent * 100 - Math.round(feePercent * 100)) > 1e-9)) {
    return { ok: false, message: 'Service fee must be between 0 and 10%, in steps of 0.01.' }
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

  const { error } = await supabase.rpc('admin_set_organizer_service_fee', {
    target_organizer_id: organizerId,
    fee_percent: feePercent,
  })
  if (error) return { ok: false, message: 'Failed to update fee.' }

  revalidatePath('/admin/organizers')
  return { ok: true }
}

async function sendDecisionEmail(supabase: Awaited<ReturnType<typeof createClient>>, organizerId: string, kind: 'approved' | 'needs_info' | 'declined', message: string, requestId?: string): Promise<boolean> {
  try {
    const result = await supabase.functions.invoke(kind === 'approved' ? 'send-organizer-approved' : 'send-organizer-review-email', {
      body: kind === 'approved' ? { organizer_id: organizerId } : { organizer_id: organizerId, kind, message, request_id: requestId },
    })
    return !result.error
  } catch { return false }
}

export async function reviewOrganizer(organizerId: string, kind: 'needs_info' | 'declined', message: string, requestId: string, retryEmailOnly = false): Promise<ApproveOrganizerResult> {
  if (!uuidPattern.test(organizerId) || !uuidPattern.test(requestId) || !['needs_info','declined'].includes(kind)) return { ok: false, message: 'Invalid organizer or action.' }
  if (typeof message !== 'string' || message.trim().length > 2000 || (kind === 'needs_info' && !message.trim())) return { ok: false, message: 'Enter a question of 1 to 2,000 characters.' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.is_anonymous) return { ok: false, message: 'You must be signed in.' }
  const { data: admin } = await supabase.from('admin_user').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!admin) return { ok: false, message: 'Not authorized.' }
  if (!retryEmailOnly) {
    const { error } = await supabase.rpc(kind === 'needs_info' ? 'admin_request_organizer_info' : 'admin_decline_organizer', { target_organizer_id: organizerId })
    if (error) return { ok: false, message: error.message.includes('ERR_NO_APPLICATION') ? 'This organizer has not submitted an application yet.' : 'Could not update this organizer. Reload and try again.' }
  }
  const emailSent = await sendDecisionEmail(supabase, organizerId, kind, message.trim(), requestId)
  revalidatePath('/admin/organizers')
  return { ok: true, emailSent }
}

export async function resendOrganizerApproval(organizerId: string): Promise<ApproveOrganizerResult> {
  if (!uuidPattern.test(organizerId)) return { ok: false, message: 'Invalid organizer.' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'You must be signed in.' }
  const { data: admin } = await supabase.from('admin_user').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!admin) return { ok: false, message: 'Not authorized.' }
  const emailSent = await sendDecisionEmail(supabase, organizerId, 'approved', '')
  return { ok: true, emailSent }
}
