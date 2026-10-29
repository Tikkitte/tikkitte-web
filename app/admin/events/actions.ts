'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { EventPresale, PresaleEntry, PresaleImport, PresaleSettings } from './presale-types'
import { createClient } from '@/lib/supabase/server'
import type { EventFinancials, EventOutstandingPayout } from '@/lib/types'

type PreviewResult =
  | {
      ok: true
      preview: EventOutstandingPayout & {
        proposed_fee_percent: number
        proposed_fee_cents: number
        proposed_net_cents: number
      }
    }
  | { ok: false; message: string }

type UpdateResult = { ok: true } | { ok: false; message: string }

function validEventId(value: string) {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= 200
}

function validFee(value: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100
}

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: adminRow } = await supabase
    .from('admin_user')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return adminRow ? supabase : null
}

export async function getEventFinancials(eventId: string): Promise<
  { ok: true; data: EventFinancials } | { ok: false; message: string }
> {
  if (!validEventId(eventId)) return { ok: false, message: 'Invalid event.' }

  try {
    const supabase = await getAdminClient()
    if (!supabase) return { ok: false, message: 'Not authorized.' }

    const { data, error } = await supabase.rpc('admin_get_event_financials', { p_event_id: eventId.trim() })
    if (error || !data) {
      return { ok: false, message: error?.code === 'P0002' ? 'Event not found.' : 'Could not load financials. Please try again.' }
    }
    return { ok: true, data: data as EventFinancials }
  } catch {
    return { ok: false, message: 'Could not load financials. Please try again.' }
  }
}

export async function getEventPayoutBalance(eventId: string): Promise<
  { ok: true; data: EventOutstandingPayout | null } | { ok: false; message: string }
> {
  if (!validEventId(eventId)) return { ok: false, message: 'Invalid event.' }

  try {
    const supabase = await getAdminClient()
    if (!supabase) return { ok: false, message: 'Not authorized.' }

    const { data, error } = await supabase
      .rpc('get_event_outstanding_payout', { p_event_id: eventId.trim() })
      .single()

    if (error) {
      if (error.code === 'P0001') return { ok: true, data: null }
      return { ok: false, message: 'Could not load the payout balance.' }
    }

    return { ok: true, data: data as EventOutstandingPayout }
  } catch {
    return { ok: false, message: 'Could not load the payout balance.' }
  }
}

export async function previewEventFee(eventId: string, feePercent: number): Promise<PreviewResult> {
  if (!validEventId(eventId) || !validFee(feePercent)) {
    return { ok: false, message: 'Enter a fee between 0 and 100.' }
  }

  const supabase = await getAdminClient()
  if (!supabase) return { ok: false, message: 'Not authorized.' }

  const { data, error } = await supabase
    .rpc('get_event_outstanding_payout', { p_event_id: eventId.trim() })
    .single()

  if (error || !data) {
    return { ok: false, message: 'Could not calculate the settlement preview.' }
  }

  const current = data as EventOutstandingPayout
  const outstandingGrossCents = Number(current.outstanding_gross_cents)
  const adjustmentsCents = Number(current.unconsumed_adjustments_cents)
  const proposedFeeCents = Math.round(outstandingGrossCents * feePercent / 100)

  return {
    ok: true,
    preview: {
      outstanding_gross_cents: outstandingGrossCents,
      fee_percent: Number(current.fee_percent),
      fee_cents: Number(current.fee_cents),
      unconsumed_adjustments_cents: adjustmentsCents,
      net_cents: Number(current.net_cents),
      proposed_fee_percent: feePercent,
      proposed_fee_cents: proposedFeeCents,
      proposed_net_cents: outstandingGrossCents - proposedFeeCents + adjustmentsCents,
    },
  }
}

export async function setEventFee(eventId: string, feePercent: number, reason: string): Promise<UpdateResult> {
  const normalizedReason = typeof reason === 'string' ? reason.trim() : ''
  if (!validEventId(eventId) || !validFee(feePercent)) {
    return { ok: false, message: 'Enter a fee between 0 and 100.' }
  }
  if (normalizedReason.length > 500) {
    return { ok: false, message: 'Keep the reason under 500 characters.' }
  }

  const supabase = await getAdminClient()
  if (!supabase) return { ok: false, message: 'Not authorized.' }

  const { error } = await supabase.rpc('admin_set_event_fee', {
    target_event_id: eventId.trim(),
    fee_percent: feePercent,
    p_reason: normalizedReason || null,
  })

  if (error) {
    if (error.message.includes('reason is required')) {
      return { ok: false, message: 'Add a reason because this event has unsettled sales.' }
    }
    return { ok: false, message: 'Failed to update the event fee.' }
  }

  revalidatePath('/admin/events')
  revalidatePath(`/dashboard/events/${eventId.trim()}`)
  revalidatePath('/dashboard')
  return { ok: true }
}


async function presaleRpc<T>(eventId: string, name: string, args: Record<string, unknown> = {}): Promise<
  { ok: true; data: T } | { ok: false; message: string }
> {
  if (!validEventId(eventId)) return { ok: false, message: 'Invalid event.' }
  try {
    const supabase = await getAdminClient()
    if (!supabase) return { ok: false, message: 'Not authorized.' }
    const { data, error } = await supabase.rpc(name, { ...args, p_event_id: eventId.trim() })
    if (error) return { ok: false, message: error.code === 'P0002' ? 'Event not found.' : 'Could not update or load the early bird list. Please try again.' }
    return { ok: true, data: data as T }
  } catch {
    return { ok: false, message: 'Early bird lists are temporarily unavailable. Please try again.' }
  }
}

export async function getEventPresale(eventId: string) {
  return presaleRpc<EventPresale>(eventId, 'admin_get_event_presale')
}

export async function listPresaleEntries(eventId: string, search: string = '') {
  if (typeof search !== 'string' || search.length > 254) return { ok: false as const, message: 'Keep the search under 254 characters.' }
  return presaleRpc<PresaleEntry[]>(eventId, 'admin_list_presale_entries', { p_search: search.trim() || null })
}

export async function saveEventPresale(eventId: string, settings: PresaleSettings): Promise<UpdateResult> {
  if (!settings || typeof settings.listed !== 'boolean' || !Number.isInteger(settings.maxPerEmail)
    || settings.maxPerEmail < 1 || settings.maxPerEmail > 10 || !Array.isArray(settings.presaleTicketIds)
    || settings.presaleTicketIds.length > 1000
    || settings.presaleTicketIds.some((id) => typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
    return { ok: false, message: 'Choose valid tickets and a limit from 1 to 10.' }
  }
  const result = await presaleRpc<null>(eventId, 'admin_set_event_presale', {
    p_listed: settings.listed, p_max_per_email: settings.maxPerEmail, p_presale_ticket_ids: settings.presaleTicketIds,
  })
  if (!result.ok) return result
  revalidatePath('/admin/events')
  revalidatePath(`/dashboard/events/${eventId.trim()}`)
  revalidateTag('events-listing', { expire: 0 })
  revalidateTag('event-core', { expire: 0 })
  return { ok: true }
}

export async function addPresaleEmails(eventId: string, rawText: string) {
  if (typeof rawText !== 'string' || rawText.length > 10_000_000) return { ok: false as const, message: 'Paste at most 20,000 emails at a time.' }
  const emails = rawText.match(/[^\s,;<>"'()]+@[^\s,;<>"'()]+/g) ?? []
  if (!emails.length) return { ok: false as const, message: 'No email addresses found.' }
  if (emails.length > 20_000) return { ok: false as const, message: 'Paste at most 20,000 emails at a time.' }
  const total: PresaleImport = { added: 0, alreadyListed: 0, invalidCount: 0, invalid: [] }
  for (let offset = 0; offset < emails.length; offset += 1000) {
    const result = await presaleRpc<PresaleImport>(eventId, 'admin_add_presale_emails', { p_emails: emails.slice(offset, offset + 1000) })
    if (!result.ok) return { ok: false as const, message: `${result.message} ${total.added} emails were added before this stopped. You can paste the same list again safely.` }
    total.added += result.data.added
    total.alreadyListed += result.data.alreadyListed
    total.invalidCount += result.data.invalidCount
    total.invalid = [...total.invalid, ...result.data.invalid].slice(0, 20)
  }
  return { ok: true as const, data: total }
}

// Emails the event link to every list entry not emailed yet. Publishing the
// event does this automatically; this covers emails added after publishing
// and retries after a failed send.
export async function sendPresaleInvites(eventId: string): Promise<{ ok: true; queued: number } | { ok: false; message: string }> {
  if (!validEventId(eventId)) return { ok: false, message: 'Invalid event.' }
  try {
    const supabase = await getAdminClient()
    if (!supabase) return { ok: false, message: 'Not authorized.' }
    const { data, error } = await supabase.functions.invoke('send-presale-invites', { body: { event_id: eventId.trim() } })
    if (error) {
      const body = await (error as { context?: Response }).context?.json?.().catch(() => null)
      return { ok: false, message: typeof body?.message === 'string' ? body.message : 'Could not send the emails. Please try again.' }
    }
    return { ok: true, queued: Number(data?.queued ?? 0) }
  } catch {
    return { ok: false, message: 'Could not send the emails. Please try again.' }
  }
}

export async function removePresaleEmail(eventId: string, email: string) {
  if (typeof email !== 'string' || email.length > 254) return { ok: false as const, message: 'Invalid email.' }
  return presaleRpc<'removed' | 'not_found' | 'in_use'>(eventId, 'admin_remove_presale_email', { p_email: email })
}
