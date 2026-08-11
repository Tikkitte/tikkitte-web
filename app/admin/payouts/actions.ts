'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type MarkPaidResult = { ok: true } | { ok: false; message: string }
type UpdateStatusResult = { ok: true } | { ok: false; message: string }

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function markPayoutPaid(payoutId: string): Promise<MarkPaidResult> {
  if (!uuidPattern.test(payoutId)) {
    return { ok: false, message: 'Invalid payout.' }
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

  const { error } = await supabase.rpc('mark_payout_paid', { target_payout_id: payoutId })
  if (error) {
    if (error.message.includes('refund has invalidated')) {
      return { ok: false, message: 'A refunded payment invalidated this payout. Cancel or reject it before creating a replacement.' }
    }
    if (error.message.includes('not pending')) {
      return { ok: false, message: 'This payout is no longer pending.' }
    }
    return { ok: false, message: 'Failed to mark payout as paid.' }
  }

  revalidatePath('/admin/payouts')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function setPayoutStatus(
  payoutId: string,
  status: 'cancelled' | 'rejected',
  reason: string,
): Promise<UpdateStatusResult> {
  const normalizedReason = typeof reason === 'string' ? reason.trim() : ''
  if (!uuidPattern.test(payoutId)) return { ok: false, message: 'Invalid payout.' }
  if (status !== 'cancelled' && status !== 'rejected') return { ok: false, message: 'Invalid payout status.' }
  if (!normalizedReason) return { ok: false, message: 'Add a reason.' }
  if (normalizedReason.length > 500) return { ok: false, message: 'Keep the reason under 500 characters.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'You must be signed in.' }

  const { data: adminRow } = await supabase
    .from('admin_user')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!adminRow) return { ok: false, message: 'Not authorized.' }

  const { error } = await supabase.rpc('admin_set_payout_status', {
    target_payout_id: payoutId,
    new_status: status,
    p_reason: normalizedReason,
  })
  if (error) {
    if (error.message.includes('not pending')) return { ok: false, message: 'This payout is no longer pending.' }
    return { ok: false, message: `Failed to mark payout as ${status}.` }
  }

  revalidatePath('/admin/payouts')
  revalidatePath('/dashboard')
  return { ok: true }
}
