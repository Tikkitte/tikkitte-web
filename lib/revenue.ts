// Organizer revenue for one payment: what the customer paid minus Tikkitte's
// service fee (payments.service_fee_cents). The fee is never organizer money, so
// dashboard totals reconcile with payout gross to the pesewa.
export function ticketRevenueCents(payment: {
  amount?: number | null
  service_fee_cents?: number | null
}): number {
  return (payment.amount ?? 0) - (payment.service_fee_cents ?? 0)
}
