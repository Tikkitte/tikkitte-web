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
  // Changed 2026-11-18: shown as 250 / 700 plus fees. LTL sets the prices below
  // so they net 250 / 700 after the 10% platform fee; the usual 2% service fee
  // stays on. One ticket costs 283.34 / 793.34 and Tikkitte keeps 33.34 / 93.34.
  // PHASE I: stored 277.78, shown as 250 + 33.34 in fees (27.78 moved + 5.56).
  '36f1413c-7a55-4a3c-beed-8ae2a3d74957': { price: 277.78, fee: 27.78 },
  // Have your Cake and Eat it (ALL ACCESS): stored 777.78, shown as 700 + 93.34.
  'c009fc46-3506-4826-ac89-688cfdc455ae': { price: 777.78, fee: 77.78 },
}

export function displayFeeGhs(ticketTypeId: string | null | undefined, price: number): number {
  const split = ticketTypeId ? DISPLAY_SPLITS[ticketTypeId] : undefined
  return split && Number(price) === split.price ? split.fee : 0
}

// In pesewas then back, so 277.78 - 27.78 reads 250, not 249.99999999999997.
export function displayTicketPrice(ticketTypeId: string | null | undefined, price: number): number {
  return Math.round((Number(price) - displayFeeGhs(ticketTypeId, price)) * 100) / 100
}

// Unit price per ticket type recorded on an order (payments.metadata.tickets).
// Receipts use it so an order keeps the split for the price it was paid at,
// not whatever the ticket costs today.
export function paidUnitPrices(metadata: unknown): Map<string, number> {
  const prices = new Map<string, number>()
  const lines = metadata && typeof metadata === 'object' ? (metadata as { tickets?: unknown }).tickets : undefined
  if (!Array.isArray(lines)) return prices
  for (const line of lines) {
    if (!line || typeof line !== 'object') continue
    const { ticket_type_id: id, unit_price: price } = line as { ticket_type_id?: unknown; unit_price?: unknown }
    if (typeof id === 'string' && typeof price === 'number' && Number.isFinite(price)) prices.set(id, price)
  }
  return prices
}
