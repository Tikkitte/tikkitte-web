'use client'

import { useEffect, useState } from 'react'
import type { EventFinancials as FinancialsData } from '@/lib/types'
import { getEventFinancials } from './actions'
import { formatCents } from './format'

const cell = 'border-t border-[var(--tikkitte-cream-border)] py-2 pr-4'
const heading = 'mb-2 text-xs font-semibold text-[var(--tikkitte-ink-soft)]'

function activityDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function EventFinancials({ eventId }: { eventId: string }) {
  const [data, setData] = useState<FinancialsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    getEventFinancials(eventId).then((result) => {
      if (cancelled) return
      if (result.ok) setData(result.data)
      else setError(result.message)
    }).catch(() => {
      if (!cancelled) setError('Could not load financials. Please try again.')
    })
    return () => { cancelled = true }
  }, [eventId, attempt])

  if (error) return (
    <div className="mt-4 flex items-center gap-3">
      <p className="text-sm text-red-700" role="alert">{error}</p>
      <button type="button" className="create-focus min-h-11 rounded-full border px-4 text-xs font-semibold" onClick={() => {
        setError(null)
        setData(null)
        setAttempt((value) => value + 1)
      }}>Try again</button>
    </div>
  )
  if (!data) return <p className="mt-4 text-sm text-[var(--tikkitte-ink-soft)]" role="status">Loading financials…</p>

  const feeCents = data.currentFeePercent === null ? null : Math.round(data.grossCents * data.currentFeePercent / 100)

  return (
    <section aria-label="Event financials" className="mt-4 space-y-5 rounded-2xl border border-[var(--tikkitte-cream-border)] bg-[var(--tikkitte-cream)] p-4">
      <div>
        <dl className="grid gap-4 rounded-xl bg-white p-4 text-sm sm:grid-cols-3">
          <div><dt className="text-xs text-[var(--tikkitte-ink-soft)]">Gross collected</dt><dd className="mt-1 font-semibold tabular-nums">{formatCents(data.grossCents)}</dd></div>
          <div><dt className="text-xs text-[var(--tikkitte-ink-soft)]">Platform fee (estimate{data.currentFeePercent === null ? '' : `, ${data.currentFeePercent}%`})</dt><dd className="mt-1 font-semibold tabular-nums">{feeCents === null ? 'Not configured' : formatCents(feeCents)}</dd></div>
          <div><dt className="text-xs text-[var(--tikkitte-ink-soft)]">Organizer net (estimate)</dt><dd className="mt-1 font-semibold tabular-nums">{feeCents === null ? '—' : formatCents(data.grossCents - feeCents)}</dd></div>
        </dl>
        <p className="mt-2 text-xs leading-5 text-[var(--tikkitte-ink-soft)]">Lifetime successful payments, before refunds. Fee and net apply today’s rate to that gross; settled payouts may use older rates. These estimates are not the outstanding payout balance.</p>
      </div>

      <dl className="grid gap-4 rounded-xl bg-white p-4 text-sm sm:grid-cols-2">
        <div><dt className="text-xs text-[var(--tikkitte-ink-soft)]">Recorded promo discounts</dt><dd className="mt-1 font-semibold tabular-nums">{formatCents(data.promoDiscountCents)}</dd></div>
        <div><dt className="text-xs text-[var(--tikkitte-ink-soft)]">Complimentary tickets</dt><dd className="mt-1 font-semibold tabular-nums">{data.compTicketQuantity.toLocaleString()} <span className="font-normal text-[var(--tikkitte-ink-soft)]">across {data.compIssuanceCount.toLocaleString()} issuances</span></dd></div>
      </dl>

      <div className="overflow-x-auto">
        <h3 className={heading}>Payment status</h3>
        {data.statusBreakdown.length === 0 ? <p className="text-sm">No payments yet.</p> : (
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Lifetime orders and amounts by payment status</caption>
            <thead><tr><th scope="col" className="pb-2 font-medium">Status</th><th scope="col" className="pb-2 text-right font-medium">Orders</th><th scope="col" className="pb-2 text-right font-medium">Amount</th></tr></thead>
            <tbody>{data.statusBreakdown.map((row) => <tr key={row.status}>
              <th scope="row" className={`${cell} font-normal capitalize`}>{row.status}</th>
              <td className={`${cell} text-right tabular-nums`}>{row.count.toLocaleString()}</td>
              <td className={`${cell} pr-0 text-right whitespace-nowrap tabular-nums`}>{formatCents(row.amountCents)}</td>
            </tr>)}</tbody>
          </table>
        )}
      </div>

      <div className="overflow-x-auto">
        <h3 className={heading}>Ticket quantities</h3>
        <p className="mb-2 text-xs text-[var(--tikkitte-ink-soft)]">Completed checkout includes free checkout tickets, before refunds. Table packages are excluded from this table.</p>
        {data.ticketQuantities.length === 0 ? <p className="text-sm">No standard ticket types.</p> : (
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Checkout and complimentary quantities by ticket type</caption>
            <thead><tr><th scope="col" className="pb-2 font-medium">Ticket</th><th scope="col" className="pb-2 text-right font-medium">Checkout</th><th scope="col" className="pb-2 text-right font-medium">Comp</th></tr></thead>
            <tbody>{data.ticketQuantities.map((row) => <tr key={row.ticketId}>
              <th scope="row" className={`${cell} font-normal`}>{row.label}</th>
              <td className={`${cell} text-right tabular-nums`}>{row.checkoutQuantity.toLocaleString()}</td>
              <td className={`${cell} pr-0 text-right tabular-nums`}>{row.compQuantity.toLocaleString()}</td>
            </tr>)}</tbody>
          </table>
        )}
      </div>

      <div className="overflow-x-auto">
        <h3 className={heading}>Promo codes</h3>
        {data.promoCodes.length === 0 ? <p className="text-sm">No promo codes.</p> : <>
          <p className="mb-2 text-xs text-[var(--tikkitte-ink-soft)]">Showing {data.promoCodes.length} of {data.promoCodeCount} codes, ordered by recorded discount. Totals include all codes; uses count successful checkouts.</p>
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Recorded promo discounts on successful checkouts</caption>
            <thead><tr><th scope="col" className="pb-2 font-medium">Code</th><th scope="col" className="pb-2 text-right font-medium">Uses</th><th scope="col" className="pb-2 text-right font-medium">Discount</th></tr></thead>
            <tbody>{data.promoCodes.map((row) => <tr key={row.id}>
              <th scope="row" className={`${cell} font-normal`}>{row.code}{row.active !== true && <span className="ml-2 text-xs text-[var(--tikkitte-ink-soft)]">({row.active === false ? 'inactive' : 'deleted'})</span>}</th>
              <td className={`${cell} text-right tabular-nums`}>{row.redemptions.toLocaleString()}</td>
              <td className={`${cell} pr-0 text-right whitespace-nowrap tabular-nums`}>{formatCents(row.discountCents)}</td>
            </tr>)}</tbody>
          </table>
        </>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <h3 className={heading}>Fee changes</h3>
          <p className="mb-2 text-xs text-[var(--tikkitte-ink-soft)]">{data.feeChangeCount ? `Showing the most recent ${data.feeChanges.length} of ${data.feeChangeCount}.` : 'No fee changes recorded.'}</p>
          <ul className="space-y-2 text-xs">{data.feeChanges.map((entry) => <li key={entry.id} className="rounded-xl bg-white p-3 break-words">
            <p className="font-semibold">{entry.oldFeePercent === null ? 'Not configured' : `${entry.oldFeePercent}%`} → {entry.newFeePercent}%</p>
            <p className="mt-1">By {entry.changedBy}</p>
            <p className="mt-1 text-[var(--tikkitte-ink-soft)]">{activityDate(entry.createdAt)}</p>
            {entry.reason && <p className="mt-1">{entry.reason}</p>}
          </li>)}</ul>
        </div>
        <div>
          <h3 className={heading}>Comp tickets issued</h3>
          <p className="mb-2 text-xs text-[var(--tikkitte-ink-soft)]">{data.compIssuanceCount ? `Showing the most recent ${data.compIssuances.length} of ${data.compIssuanceCount}. Totals include all issuances.` : 'No complimentary tickets issued.'}</p>
          <ul className="space-y-2 text-xs">{data.compIssuances.map((entry) => <li key={entry.id} className="rounded-xl bg-white p-3 break-words">
            <p className="font-semibold">{entry.recipientName} · {entry.ticketLabel} × {entry.quantity}</p>
            <p className="mt-1 text-[var(--tikkitte-ink-soft)]">{activityDate(entry.sentAt)}</p>
            {entry.note && <p className="mt-1">{entry.note}</p>}
          </li>)}</ul>
        </div>
      </div>
    </section>
  )
}
