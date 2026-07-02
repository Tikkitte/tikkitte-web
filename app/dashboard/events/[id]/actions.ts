'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ComplimentaryTicket, TrackingLink } from '@/lib/types'

type SendCompTicketInput = {
  eventId: string
  ticketTypeId: string
  recipientName: string
  recipientEmail: string
  quantity: number
  note?: string
}

type SendCompTicketResult =
  | { ok: true; compTicket: ComplimentaryTicket }
  | { ok: false; message: string }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type CreateTrackingLinkInput = {
  eventId: string
  name: string
  slug: string
}

type CreateTrackingLinkResult =
  | { ok: true; trackingLink: TrackingLink }
  | { ok: false; message: string }

const slugPattern = /^[a-z0-9-]{2,20}$/

export async function sendCompTicket(input: SendCompTicketInput): Promise<SendCompTicketResult> {
  const eventId = input.eventId.trim()
  const ticketTypeId = input.ticketTypeId.trim()
  const recipientName = input.recipientName.trim()
  const recipientEmail = input.recipientEmail.trim().toLowerCase()
  const quantity = Number(input.quantity)
  const note = input.note?.trim() || null

  if (!eventId || !ticketTypeId || !recipientName || !recipientEmail) {
    return { ok: false, message: 'Fill in all required fields.' }
  }
  if (!emailPattern.test(recipientEmail)) {
    return { ok: false, message: 'Enter a valid recipient email.' }
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
    return { ok: false, message: 'Quantity must be between 1 and 10.' }
  }
  if (recipientName.length > 120) {
    return { ok: false, message: 'Recipient name is too long.' }
  }
  if (note && note.length > 300) {
    return { ok: false, message: 'Note must be 300 characters or fewer.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: 'You must be signed in to send complimentary tickets.' }
  }

  const { data: event, error: eventError } = await supabase
    .from('event')
    .select('id')
    .eq('id', eventId)
    .eq('organizer_id', user.id)
    .maybeSingle()

  if (eventError || !event) {
    return { ok: false, message: 'Event not found.' }
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('ticket')
    .select('id')
    .eq('id', ticketTypeId)
    .eq('event_id', eventId)
    .maybeSingle()

  if (ticketError || !ticket) {
    return { ok: false, message: 'Ticket type is not available for this event.' }
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) {
    return { ok: false, message: 'Your session expired. Please sign in again.' }
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-comp-ticket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      event_id: eventId,
      ticket_type_id: ticketTypeId,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      quantity,
      note,
    }),
  })

  const result = await response.json().catch(() => null) as { message?: string; comp_ticket?: ComplimentaryTicket } | null
  if (!response.ok || !result?.comp_ticket) {
    return { ok: false, message: result?.message ?? 'Failed to send complimentary ticket.' }
  }

  revalidatePath(`/dashboard/events/${eventId}`)

  return { ok: true, compTicket: result.comp_ticket }
}

export async function createTrackingLink(input: CreateTrackingLinkInput): Promise<CreateTrackingLinkResult> {
  const eventId = input.eventId.trim()
  const name = input.name.trim()
  const slug = input.slug.trim().toLowerCase()

  if (!eventId || !name || !slug) {
    return { ok: false, message: 'Name and slug are required.' }
  }
  if (name.length > 80) {
    return { ok: false, message: 'Name must be 80 characters or fewer.' }
  }
  if (!slugPattern.test(slug) || slug.includes('--')) {
    return { ok: false, message: 'Slug must be 2-20 characters using lowercase letters, numbers, or hyphens.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: 'You must be signed in to create tracking links.' }
  }

  const { data: event, error: eventError } = await supabase
    .from('event')
    .select('id')
    .eq('id', eventId)
    .eq('organizer_id', user.id)
    .maybeSingle()

  if (eventError || !event) {
    return { ok: false, message: 'Event not found.' }
  }

  const { data, error } = await supabase
    .from('tracking_link')
    .insert({
      event_id: eventId,
      organizer_id: user.id,
      name,
      slug,
    })
    .select('*')
    .single()

  if (error || !data) {
    const message = error?.code === '23505'
      ? 'A tracking link with this slug already exists for this event.'
      : error?.message ?? 'Failed to create tracking link.'
    return { ok: false, message }
  }

  revalidatePath(`/dashboard/events/${eventId}`)

  return { ok: true, trackingLink: data as TrackingLink }
}
