// Order pricing for the checkout UI, in integer pesewas. This mirrors the
// server (quote-payment, make-payment and _shared/promo.ts) step for step so
// the total shown to the customer equals the quoted total. The server stays
// authoritative: checkout compares its quote against this and never charges a
// total the customer was not shown.
//
// Golden vectors (base pesewas -> fee pesewas at 200 bps):
//   15000 -> 300, 20000 -> 400, 27000 -> 540, 24 -> 0, 25 -> 1, 74 -> 1, 75 -> 2

// Service fee rate in basis points (200 = 2%). Stays off (0) unless
// NEXT_PUBLIC_SERVICE_FEE_BPS is set at build time, so shipping this UI ahead of
// the server cannot show customers a fee that is not charged.
const configuredBps = Number(process.env.NEXT_PUBLIC_SERVICE_FEE_BPS)
export const SERVICE_FEE_BPS =
  Number.isInteger(configuredBps) && configuredBps > 0 && configuredBps <= 1000 ? configuredBps : 0

// Charged once per order on the post-discount ticket subtotal, half up.
export function computeServiceFeeMinor(baseMinor: number, bps: number = SERVICE_FEE_BPS): number {
  if (!Number.isInteger(baseMinor) || baseMinor <= 0 || !Number.isInteger(bps) || bps <= 0) return 0
  return Math.floor((baseMinor * bps + 5000) / 10000)
}

export type PricedLine = { id: string; price: number; quantity: number }

export type PricingPromo = {
  discount_type: 'percent' | 'fixed'
  discount_value: number
  ticket_type_id: string | null
}

export type OrderPricing = {
  subtotalMinor: number
  discountMinor: number
  serviceFeeMinor: number
  totalMinor: number
}

export function priceOrder(lines: PricedLine[], promo: PricingPromo | null): OrderPricing {
  const lineSubtotals = lines.map((line) => ({
    id: line.id,
    subtotalMinor: Math.round(line.price * 100) * line.quantity,
  }))
  const subtotalMinor = lineSubtotals.reduce((sum, line) => sum + line.subtotalMinor, 0)

  let discountMinor = 0
  if (promo) {
    const eligibleMinor = lineSubtotals.reduce(
      (sum, line) => (promo.ticket_type_id && line.id !== promo.ticket_type_id ? sum : sum + line.subtotalMinor),
      0,
    )
    if (eligibleMinor > 0) {
      const raw = promo.discount_type === 'percent'
        ? Math.round(eligibleMinor * (Number(promo.discount_value) / 100))
        : Math.round(Number(promo.discount_value) * 100)
      discountMinor = Number.isFinite(raw) && raw > 0 ? Math.min(raw, eligibleMinor) : 0
    }
  }

  const baseMinor = Math.max(0, subtotalMinor - discountMinor)
  const serviceFeeMinor = computeServiceFeeMinor(baseMinor)
  return { subtotalMinor, discountMinor, serviceFeeMinor, totalMinor: baseMinor + serviceFeeMinor }
}

// Server breakdowns carry GHS amounts (subtotal, discount, service_fee, total).
export function pricingFromBreakdown(breakdown: unknown): OrderPricing | null {
  if (!breakdown || typeof breakdown !== 'object') return null
  const b = breakdown as Record<string, unknown>
  const toMinor = (value: unknown) => {
    const n = Number(value)
    return Number.isFinite(n) ? Math.round(n * 100) : null
  }
  const subtotalMinor = toMinor(b.subtotal)
  const discountMinor = toMinor(b.discount ?? 0)
  const serviceFeeMinor = toMinor(b.service_fee ?? 0)
  const totalMinor = toMinor(b.total)
  if (subtotalMinor === null || discountMinor === null || serviceFeeMinor === null || totalMinor === null) return null
  return { subtotalMinor, discountMinor, serviceFeeMinor, totalMinor }
}

export function formatMinor(minor: number): string {
  return `GH₵ ${(minor / 100).toFixed(2)}`
}
