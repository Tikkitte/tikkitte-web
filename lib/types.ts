export type OrganizerProfile = {
  id: string
  display_name: string
  email: string
  approved: boolean
  logo_url: string | null
  bio: string | null
  created_at: string
}

export type Event = {
  id: string
  name: string
  date: string
  time: string
  description: string | null
  venue: string | null
  image: string[] | null
  cancelled: boolean
  organizer_id: string | null
}

export type Ticket = {
  id: string
  event_id: string
  label: string
  price: number
  total_quantity: number | null
  purchased_quantity: number
  available_quantity: number | null
}

export type UserTicket = {
  id: string
  user_id: string
  event_id: string
  ticket_type_id: string
  quantity: number
  payment_reference: string
}

export type EventWithTickets = Event & {
  tickets: Ticket[]
}

export type Payment = {
  reference: string
  user_id: string
  event_id: string
  status: string
  amount: number
  ticket_type_id: string
  quantity: number
  paid_at: string | null
  metadata: Record<string, unknown> | null
}

export type SalesRow = {
  ticket: Ticket
  sold: number
  revenue: number
}
