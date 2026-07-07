'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type MarkPaidResult = { ok: true } | { ok: false; message: string }

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
  if (error) return { ok: false, message: 'Failed to mark payout as paid.' }

  revalidatePath('/admin/payouts')
  return { ok: true }
}
