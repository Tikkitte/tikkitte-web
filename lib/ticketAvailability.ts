import type { Ticket } from '@/lib/types'

type TicketSaleWindow = Pick<
  Ticket,
  'sale_start_date' | 'sale_start_time' | 'sale_end_date' | 'sale_end_time'
>

type TicketAvailability = TicketSaleWindow & Pick<Ticket, 'available_quantity'>

// Ticket sale windows are entered in Ghana time (GMT/UTC, with no daylight saving).
export function saleDateTime(date: string, time: string | null, endOfDay = false) {
  const clock = time ? time.slice(0, 8) : endOfDay ? '23:59:59' : '00:00:00'
  return new Date(`${date}T${clock}Z`)
}

export function formatSaleDate(date: string, time: string | null) {
  const value = saleDateTime(date, time)
  return value.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Africa/Accra',
    ...(time ? { hour: 'numeric', minute: '2-digit', hour12: true } : {}),
  })
}

export function ticketSaleStatus(ticket: TicketSaleWindow, now = new Date()) {
  if (
    ticket.sale_start_date &&
    now < saleDateTime(ticket.sale_start_date, ticket.sale_start_time)
  ) {
    return {
      available: false,
      label: `On sale ${formatSaleDate(ticket.sale_start_date, ticket.sale_start_time)}`,
      saleStartDate: ticket.sale_start_date,
    }
  }

  if (
    ticket.sale_end_date &&
    now > saleDateTime(ticket.sale_end_date, ticket.sale_end_time, true)
  ) {
    return { available: false, label: 'Sales ended' }
  }

  return { available: true, label: null }
}

export function isTicketCurrentlyPurchasable(ticket: TicketAvailability, now = new Date()) {
  const hasInventory = ticket.available_quantity === null || ticket.available_quantity > 0
  return hasInventory && ticketSaleStatus(ticket, now).available
}
