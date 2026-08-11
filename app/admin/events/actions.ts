'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { EventOutstandingPayout } from '@/lib/types'

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
