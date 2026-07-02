'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ComplimentaryTicket } from '@/lib/types'

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

  const { data, error } = await supabase
    .from('complimentary_ticket')
    .insert({
      event_id: eventId,
      ticket_type_id: ticketTypeId,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      quantity,
      note,
    })
    .select('*')
    .single()

  if (error || !data) {
    return { ok: false, message: error?.message ?? 'Failed to send complimentary ticket.' }
  }

  // TODO: trigger edge function to email recipient
  revalidatePath(`/dashboard/events/${eventId}`)

  return { ok: true, compTicket: data as ComplimentaryTicket }
}
