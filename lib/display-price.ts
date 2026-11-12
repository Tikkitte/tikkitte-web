// TEMPORARY: remove once LTL New Year @Enzo (2027-01-01) is over, unless LTL
// asks to keep it for a later event. To remove: delete this file and
// stealthstartup/supabase/functions/_shared/display-price.ts, undo their call
// sites (grep -rn "display-price" in both repos), then redeploy the web app and
// the ticket email functions (paystack-webhook, verify-payment,
// retry-ticket-emails, reconcile-stuck-payments).
//
// Display-only price split, added 2026-11-11 at LTL's request.
// Mirrored in stealthstartup/supabase/functions/_shared/display-price.ts for
// the ticket email; keep the two in sync.
//
// The stored ticket price is what buyers are charged and what payouts use;
// nothing here changes that. For the tickets below, the web UI shows the price
// minus `fee` and adds `fee` to the service fee line, so the headline price is
// lower while every total stays the same.
//
// Keyed by ticket type ID, amounts in GHS per ticket. A split only applies
// while the stored price still equals `price`, so a later price change falls
// back to showing the real price. A new tier needs its own entry.
const DISPLAY_SPLITS: Record<string, { price: number; fee: number }> = {
  // LTL New Year @Enzo, Early Access: stored 220, shown as 200 + 20 in fees.
  'c2e4c748-95e7-433a-8a50-a195bc3f2e48': { price: 220, fee: 20 },
}

export function displayFeeGhs(ticketTypeId: string | null | undefined, price: number): number {
  const split = ticketTypeId ? DISPLAY_SPLITS[ticketTypeId] : undefined
  return split && Number(price) === split.price ? split.fee : 0
}

export function displayTicketPrice(ticketTypeId: string | null | undefined, price: number): number {
  return price - displayFeeGhs(ticketTypeId, price)
}
