'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { BANK_PROVIDERS, MOBILE_MONEY_PROVIDERS, type PayoutMethod } from './payout-options'

type ActionResult = { ok: true } | { ok: false; message: string }

type AddPayoutAccountInput = {
  method: PayoutMethod
  provider: string
  accountNumber: string
  accountName: string
  branch: string
  isPrimary: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseAddInput(input: unknown): AddPayoutAccountInput | null {
  if (!isRecord(input)) return null
  if (
    (input.method !== 'mobile_money' && input.method !== 'bank_transfer') ||
    typeof input.provider !== 'string' ||
    typeof input.accountNumber !== 'string' ||
    typeof input.accountName !== 'string' ||
    typeof input.branch !== 'string' ||
    typeof input.isPrimary !== 'boolean'
  ) {
    return null
  }

  return {
    method: input.method,
    provider: input.provider,
    accountNumber: input.accountNumber,
    accountName: input.accountName,
    branch: input.branch,
    isPrimary: input.isPrimary,
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function validProvidersFor(method: PayoutMethod) {
  return method === 'mobile_money' ? MOBILE_MONEY_PROVIDERS : BANK_PROVIDERS
}

export async function addPayoutAccount(input: unknown): Promise<ActionResult> {
  const parsed = parseAddInput(input)
  if (!parsed) return { ok: false, message: 'Invalid payout account details.' }

  const provider = parsed.provider.trim()
  const accountNumber = parsed.accountNumber.trim()
  const accountName = parsed.accountName.trim()
  const branch = parsed.method === 'bank_transfer' ? parsed.branch.trim() : ''
  const validProviders = validProvidersFor(parsed.method)

  if (!validProviders.includes(provider as never)) return { ok: false, message: 'Invalid provider.' }
  if (!accountNumber) return { ok: false, message: 'Account number required.' }
  if (!accountName) return { ok: false, message: 'Account name required.' }
  if (accountNumber.length > 80) return { ok: false, message: 'Account number is too long.' }
  if (accountName.length > 120) return { ok: false, message: 'Account name is too long.' }
  if (branch.length > 120) return { ok: false, message: 'Branch is too long.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'Not authenticated.' }

  const { data: existingAccounts } = await supabase
    .from('payout_account')
    .select('id')
    .eq('organizer_id', user.id)
    .limit(1)

  const { error } = await supabase.from('payout_account').insert({
    organizer_id: user.id,
    method: parsed.method,
    provider,
    account_number: accountNumber,
    account_name: accountName,
    branch: branch || null,
    is_primary: (existingAccounts ?? []).length === 0 || parsed.isPrimary,
  })

  if (error) return { ok: false, message: 'Could not save account. Try again.' }
  revalidatePath('/dashboard/settings')
  return { ok: true }
}

export async function deletePayoutAccount(id: string): Promise<ActionResult> {
  if (!uuidPattern.test(id)) return { ok: false, message: 'Invalid payout account.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'Not authenticated.' }

  const { data: account } = await supabase
    .from('payout_account')
    .select('id, is_primary')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .maybeSingle()

  if (!account) return { ok: false, message: 'Payout account not found.' }
  if (account.is_primary) return { ok: false, message: 'Cannot delete primary account.' }

  const { data: referencedPayout } = await supabase
    .from('payout')
    .select('id')
    .eq('payout_account_id', id)
    .limit(1)
    .maybeSingle()
  if (referencedPayout) {
    return { ok: false, message: 'This account is attached to payout history and cannot be deleted.' }
  }

  const { error } = await supabase
    .from('payout_account')
    .delete()
    .eq('id', id)
    .eq('organizer_id', user.id)

  if (error) return { ok: false, message: 'Could not delete account.' }
  revalidatePath('/dashboard/settings')
  return { ok: true }
}

export async function setPrimaryPayoutAccount(id: string): Promise<ActionResult> {
  if (!uuidPattern.test(id)) return { ok: false, message: 'Invalid payout account.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, message: 'Not authenticated.' }

  const { error } = await supabase
    .from('payout_account')
    .update({ is_primary: true })
    .eq('id', id)
    .eq('organizer_id', user.id)

  if (error) return { ok: false, message: 'Could not update account.' }
  revalidatePath('/dashboard/settings')
  return { ok: true }
}
