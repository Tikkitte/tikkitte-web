import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format'
import type { ComplimentaryTicket, Ticket } from '@/lib/types'
import CompTicketManager from '@/app/dashboard/events/[id]/CompTicketManager'
import EventPicker from './EventPicker'
import AdminPageHeader from '../AdminPageHeader'

type EventSummary = {
  id: string
  name: string | null
  date: string | null
  venue: string | null
}

type Props = {
  searchParams: Promise<{ event?: string | string[] }>
}

export default async function AdminCompTicketsPage({ searchParams }: Props) {
  const supabase = await createClient()
  const requestedEvent = (await searchParams).event
  const requestedEventId = Array.isArray(requestedEvent) ? requestedEvent[0] : requestedEvent

  const { data: rawEvents, error: eventsError } = await supabase
    .from('event')
    .select('id, name, date, venue')
    .order('date', { ascending: false, nullsFirst: false })

  const events = (rawEvents ?? []) as EventSummary[]

  if (eventsError) {
    console.error('[admin-comp-tickets] event list failed', eventsError.message)
  }

  const selectedEvent = events.find((event) => event.id === requestedEventId) ?? events[0] ?? null

  const [{ data: rawTickets, error: ticketsError }, { data: rawCompTickets, error: compTicketsError }] =
    selectedEvent
      ? await Promise.all([
          supabase
            .from('ticket')
            .select('*')
            .eq('event_id', selectedEvent.id)
            .eq('is_table_ticket', false)
            .order('type'),
          supabase
            .from('complimentary_ticket')
            .select('id, event_id, ticket_type_id, recipient_name, recipient_email, quantity, sent_at, note')
            .eq('event_id', selectedEvent.id)
            .order('sent_at', { ascending: false }),
        ])
      : [
          { data: [] as Ticket[], error: null },
          { data: [] as ComplimentaryTicket[], error: null },
        ]

  if (ticketsError) {
    console.error('[admin-comp-tickets] ticket list failed', ticketsError.message)
  }
  if (compTicketsError) {
    console.error('[admin-comp-tickets] history list failed', compTicketsError.message)
  }

  const loadError = Boolean(eventsError || ticketsError || compTicketsError)

  return (
    <div>
      <AdminPageHeader title="Complimentary tickets" description="Issue scannable tickets without reducing paid availability or increasing sales totals." />

      {loadError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Some ticket data could not be loaded. Refresh the page before issuing a ticket.
        </div>
      )}

      {!selectedEvent ? (
        <div className="create-card p-8 text-center">
          <h2 className="font-semibold">No events available</h2>
          <p className="mt-1 text-sm text-[var(--tikkitte-ink-faint)]">
            Create an event before issuing complimentary tickets.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="create-card p-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)] md:items-end">
              <EventPicker
                events={events.map((event) => ({
                  id: event.id,
                  name: event.name?.trim() || 'Untitled event',
                }))}
                selectedEventId={selectedEvent.id}
              />
              <div className="rounded-[16px] bg-[var(--tikkitte-cream)] px-4 py-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]">Selected event</p>
                <p className="mt-1 text-sm font-semibold">
                  {selectedEvent.name?.trim() || 'Untitled event'}
                </p>
                <p className="mt-1 text-xs text-[var(--tikkitte-ink-soft)]">
                  {formatDate(selectedEvent.date)}
                  {selectedEvent.venue ? ` · ${selectedEvent.venue}` : ''}
                </p>
              </div>
            </div>
          </section>

          <CompTicketManager
            key={selectedEvent.id}
            eventId={selectedEvent.id}
            tickets={(rawTickets ?? []) as Ticket[]}
            initialCompTickets={(rawCompTickets ?? []) as ComplimentaryTicket[]}
          />
        </div>
      )}
    </div>
  )
}
