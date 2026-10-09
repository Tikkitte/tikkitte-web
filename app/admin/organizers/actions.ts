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

async function callSubaccountAction(body: Record<string, unknown>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('You must be signed in.')
  const { data: admin } = await supabase.from('admin_user').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!admin) throw new Error('Not authorized.')
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('You must be signed in.')
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-organizer-subaccount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  const result = await response.json()
  if (!response.ok) throw new Error(result.message || 'Unable to complete the subaccount request.')
  return result
}

export async function getSubaccountBanks(): Promise<
  { ok: true; banks: Array<{ code: string; name: string }> } | { ok: false; message: string }
> {
  try {
    const result = await callSubaccountAction({ action: 'banks' })
    return { ok: true, banks: result.banks }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Unable to load banks.' }
  }
}

export type SubaccountPreview = {
  account_id: string
  account_name: string
  entered_account_name: string
  entered_provider: string
  account_last4: string
}

export async function resolveSubaccount(organizerId: string, bankCode: string): Promise<
  { ok: true; preview: SubaccountPreview } | { ok: false; message: string }
> {
  if (!uuidPattern.test(organizerId) || typeof bankCode !== 'string' || !/^[a-z0-9-]{1,30}$/i.test(bankCode)) {
    return { ok: false, message: 'Select a valid organizer and bank.' }
  }
  try {
    const preview = await callSubaccountAction({ action: 'resolve', organizer_id: organizerId, bank_code: bankCode })
    return { ok: true, preview }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Unable to verify account.' }
  }
}

export async function createOrganizerSubaccount(organizerId: string, bankCode: string, accountId: string, accountName: string): Promise<ApproveOrganizerResult> {
  if (!uuidPattern.test(organizerId) || !uuidPattern.test(accountId) || typeof bankCode !== 'string' ||
    !/^[a-z0-9-]{1,30}$/i.test(bankCode) || typeof accountName !== 'string' || !accountName.trim() || accountName.length > 300) {
    return { ok: false, message: 'Verify the bank account before creating a subaccount.' }
  }
  try {
    await callSubaccountAction({ action: 'create', organizer_id: organizerId, bank_code: bankCode, account_id: accountId, confirmed_account_name: accountName })
    revalidatePath('/admin/organizers')
    revalidatePath('/admin/events')
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Unable to create subaccount.' }
  }
}
