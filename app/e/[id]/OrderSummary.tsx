'use client'

import { useId, useState } from 'react'
import { formatMinor } from '@/lib/checkout-pricing'

type Props = {
  ticketCount: number
  subtotalMinor: number
  discountMinor: number
  promoCode?: string | null
  serviceFeeMinor: number
  totalMinor: number
}

export default function OrderSummary({
  ticketCount,
  subtotalMinor,
  discountMinor,
  promoCode,
  serviceFeeMinor,
  totalMinor,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const rowsId = useId()

  if (ticketCount === 0) return null

  // No service fee: keep the original discount-only card.
  if (serviceFeeMinor === 0) {
    if (discountMinor === 0) return null
    return (
      <div className="mb-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm">
        <div className="flex justify-between text-[#5F5D54]">
          <span>Subtotal</span>
          <span>{formatMinor(subtotalMinor)}</span>
        </div>
        <div className="mt-1 flex justify-between font-semibold text-green-700">
          <span>Discount</span>
          <span>-{formatMinor(discountMinor)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-3 rounded-xl border border-[#E4DFD1] bg-[#F4F2EC] px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#191917]">Total</p>
          <p className="mt-0.5 text-sm text-[#5F5D54]">
            {ticketCount} Ticket{ticketCount > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          aria-controls={rowsId}
          aria-label={expanded ? 'Hide price breakdown' : 'Show price breakdown'}
          className="flex items-center gap-2 rounded-lg py-0.5 pl-2 text-[#191917]"
        >
          <span className="text-lg font-bold tabular-nums">{formatMinor(totalMinor)}</span>
          <svg
            className={`h-5 w-5 text-[#5F5D54] transition-transform ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="10" cy="10" r="8.5" />
            <path d="M6.5 8.5 10 12l3.5-3.5" />
          </svg>
        </button>
      </div>

      {expanded && (
        <div id={rowsId} className="mt-3 space-y-1.5 border-t border-[#E4DFD1] pt-3 text-sm">
          <div className="flex justify-between text-[#5F5D54]">
            <span>Tickets x{ticketCount}</span>
            <span className="tabular-nums">{formatMinor(subtotalMinor)}</span>
          </div>
          {discountMinor > 0 && (
            <div className="flex justify-between font-semibold text-green-700">
              <span>Discount{promoCode ? ` (${promoCode})` : ''}</span>
              <span className="tabular-nums">-{formatMinor(discountMinor)}</span>
            </div>
          )}
          <div className="flex justify-between text-[#5F5D54]">
            <span>Service fee</span>
            <span className="tabular-nums">{formatMinor(serviceFeeMinor)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
