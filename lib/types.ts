export type OrganizerProfile = {
  id: string
  display_name: string
  email: string
  approved: boolean
  logo_url: string | null
  bio: string | null
  slug: string | null
  created_at: string
}

export type AdminUser = {
  user_id: string
  created_at: string
}

export type Event = {
  id: string
  name: string
  slug: string | null
  date: string
  time: string
  description: string | null
  venue: string | null
  maps_link: string | null
  floor_plan_venue: 'aria' | null
  image: string[] | null
  cancelled: boolean
  organizer_id: string | null
  preview_images: string[] | null
  preview_videos: string[] | null
  scanner_pin: string | null
  published: boolean
  ever_published: boolean
  end_date: string | null
  end_time: string | null
  last_alert_sent_at: string | null
}

export type Ticket = {
  id: string
  event_id: string
  type: number
  label: string
  price: number
  total_quantity: number | null
  purchased_quantity: number
  available_quantity: number | null
  min_per_order: number
  max_per_order: number | null
  sale_start_date: string | null
  sale_start_time: string | null
  sale_end_date: string | null
  sale_end_time: string | null
  is_table_ticket: boolean
}

export type TablePackage = {
  id: string
  event_id: string
  ticket_type_id?: string
  table_code: string
  table_kind: 'section' | 'floor' | 'round'
  tier_name: string
  guest_capacity: number
  min_spend: number
  deposit: number
  bottles: string[]
  enabled: boolean
  reservation_status: 'available' | 'awaiting_payment' | 'booked'
  created_at?: string
  updated_at?: string
}

export type UserTicket = {
  id: string
  user_id: string
  event_id: string
  ticket_type_id: string
  quantity: number
  payment_reference: string
  used: boolean
  scanned_at: string | null
  scanned_by: string | null
}

export type EventWithTickets = Event & {
  tickets: Ticket[]
}

export type Payment = {
  id: string
  reference: string
  user_id: string
  event_id: string
  status: string
  amount: number
  ticket_type_id: string
  quantity: number
  paid_at: string | null
  metadata: Record<string, unknown> | null
  refund_status: 'pending' | 'success' | 'failed' | null
  refund_reference: string | null
  refunded_at: string | null
  refund_error: string | null
}

export type SalesRow = {
  ticket: Ticket
  sold: number
  revenue: number
}

export type PromoCode = {
  id: string
  event_id: string
  code: string
  discount_type: 'percent' | 'fixed'
  discount_value: number
  max_uses: number | null
  uses_count: number
  ticket_type_id: string | null
  active: boolean
  created_at: string
}

export type ComplimentaryTicket = {
  id: string
  event_id: string
  ticket_type_id: string
  recipient_name: string
  recipient_email: string
  quantity: number
  sent_at: string
  note: string | null
}

export type TrackingLink = {
  id: string
  event_id: string
  organizer_id: string
  name: string
  slug: string
  clicks: number
  created_at: string
}

export type Payout = {
  id: string
  organizer_id: string
  event_id: string | null
  payout_account_id: string | null
  amount: number
  status: 'pending' | 'paid'
  paid_at: string | null
  note: string | null
  created_at: string
}

export type PayoutAccount = {
  id: string
  organizer_id: string
  method: 'mobile_money' | 'bank_transfer'
  provider: string
  account_number: string
  account_name: string
  is_primary: boolean
  created_at: string | null
}
