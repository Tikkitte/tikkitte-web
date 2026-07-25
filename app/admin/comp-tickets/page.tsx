import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format'
import type { ComplimentaryTicket, Ticket } from '@/lib/types'
import CompTicketManager from '@/app/dashboard/events/[id]/CompTicketManager'
import EventPicker from './EventPicker'

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Complimentary tickets</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
          Issue a scannable ticket for any event. Complimentary tickets do not reduce paid
          availability or increase sales totals.
        </p>
      </div>

      {loadError && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          Some ticket data could not be loaded. Refresh the page before issuing a ticket.
        </div>
      )}

      {!selectedEvent ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-sm">
          <h2 className="text-base font-semibold text-gray-900">No events available</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create an event before issuing complimentary tickets.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(240px,0.8fr)] md:items-end">
              <EventPicker
                events={events.map((event) => ({
                  id: event.id,
                  name: event.name?.trim() || 'Untitled event',
                }))}
                selectedEventId={selectedEvent.id}
              />
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Selected event</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {selectedEvent.name?.trim() || 'Untitled event'}
                </p>
                <p className="mt-1 text-xs text-gray-500">
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
