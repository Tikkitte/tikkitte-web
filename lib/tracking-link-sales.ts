import type { Payment, PaymentAttribution } from './types'
import { ticketRevenueCents } from './revenue'

export type LinkSales = { orders: number; tickets: number; revenueCents: number }

export function summarizeTrackingLinkSales(
  payments: Pick<Payment, 'reference' | 'status' | 'provider' | 'refund_status' | 'quantity' | 'amount' | 'service_fee_cents'>[],
  attributions: Pick<PaymentAttribution, 'payment_reference' | 'tracking_link_id'>[],
): { byLink: Record<string, LinkSales>; unattributed: LinkSales } {
  const linkByPayment = new Map(attributions.map((row) => [row.payment_reference, row.tracking_link_id]))
  const byLink: Record<string, LinkSales> = {}
  const unattributed: LinkSales = { orders: 0, tickets: 0, revenueCents: 0 }
  for (const payment of payments) {
    if (!['success', 'free'].includes(payment.status) || payment.refund_status === 'success' || payment.provider === 'complimentary') continue
    const linkId = linkByPayment.get(payment.reference)
    const sales = linkId
      ? (byLink[linkId] ??= { orders: 0, tickets: 0, revenueCents: 0 })
      : unattributed
    sales.orders += 1
    sales.tickets += payment.quantity
    sales.revenueCents += ticketRevenueCents(payment)
  }
  return { byLink, unattributed }
}
