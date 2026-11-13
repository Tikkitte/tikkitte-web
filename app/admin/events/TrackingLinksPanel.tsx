'use client'

import { useEffect, useState } from 'react'
import { formatCents } from './format'
import { getEventTrackingLinks, type AdminEventTrackingLinks, type AdminLinkSales } from './tracking-actions'

const cell = 'border-t border-[var(--tikkitte-cream-border)] py-2 pr-4'
const heading = 'mb-2 text-xs font-semibold text-[var(--tikkitte-ink-soft)]'

// Credits written at checkout land before payment completes. A credit written
// well after the sale was added later, for example by hand.
const LATE_CREDIT_MS = 10 * 60 * 1000

// Events and organizers are in Ghana, so show Ghana time (GMT) everywhere.
function ghanaTime(value: string) {
  return new Date(value).toLocaleString('en-GB', {
    timeZone: 'Africa/Accra',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function plural(count: number, noun: string) {
  return `${count.toLocaleString()} ${noun}${count === 1 ? '' : 's'}`
}

function salesSummary(sales: AdminLinkSales) {
  return `${plural(sales.orders, 'order')} · ${plural(sales.tickets, 'ticket')} · ${formatCents(sales.revenueCents)}`
}

export default function TrackingLinksPanel({ eventId }: { eventId: string }) {
  const [data, setData] = useState<AdminEventTrackingLinks | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    getEventTrackingLinks(eventId).then((result) => {
      if (cancelled) return
      if (result.ok) setData(result.data)
      else setError(result.message)
    }).catch(() => {
      if (!cancelled) setError('Could not load tracking links. Please try again.')
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
  if (!data) return <p className="mt-4 text-sm text-[var(--tikkitte-ink-soft)]" role="status">Loading tracking links…</p>

  const linkById = new Map(data.links.map((link) => [link.id, link]))
  const credited = data.links.reduce(
    (sum, link) => ({ orders: sum.orders + link.orders, tickets: sum.tickets + link.tickets, revenueCents: sum.revenueCents + link.revenueCents }),
    { orders: 0, tickets: 0, revenueCents: 0 },
  )

  return (
    <section aria-label="Tracking links" className="mt-4 space-y-5 rounded-2xl border border-[var(--tikkitte-cream-border)] bg-[var(--tikkitte-cream)] p-4">
      <dl className="grid gap-4 rounded-xl bg-white p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[var(--tikkitte-ink-soft)]">Credited to a link</dt>
          <dd className="mt-1 font-semibold tabular-nums">{salesSummary(credited)}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--tikkitte-ink-soft)]">No tracking link</dt>
          <dd className="mt-1 font-semibold tabular-nums">{salesSummary(data.unattributed)}</dd>
        </div>
      </dl>

      <div className="overflow-x-auto">
        <h3 className={heading}>Links</h3>
        {data.links.length === 0 ? <p className="text-sm">The organizer has not created any tracking links for this event.</p> : (
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Clicks and credited sales per tracking link</caption>
            <thead><tr>
              <th scope="col" className="pb-2 pr-4 font-medium">Link</th>
              <th scope="col" className="pb-2 pr-4 text-right font-medium">Clicks</th>
              <th scope="col" className="pb-2 pr-4 text-right font-medium">Orders</th>
              <th scope="col" className="pb-2 pr-4 text-right font-medium">Tickets</th>
              <th scope="col" className="pb-2 pr-4 text-right font-medium">Revenue</th>
              <th scope="col" className="pb-2 text-right font-medium">Created</th>
            </tr></thead>
            <tbody>
              {data.links.map((link) => <tr key={link.id}>
                <th scope="row" className={`${cell} font-normal`}>
                  <span className="font-semibold">{link.name}</span>
                  <span className="block whitespace-nowrap font-mono text-xs text-[var(--tikkitte-ink-soft)]">?ref={link.slug}</span>
                </th>
                <td className={`${cell} text-right tabular-nums`}>{link.clicks.toLocaleString()}</td>
                <td className={`${cell} text-right tabular-nums`}>{link.orders.toLocaleString()}</td>
                <td className={`${cell} text-right tabular-nums`}>{link.tickets.toLocaleString()}</td>
                <td className={`${cell} text-right whitespace-nowrap tabular-nums`}>{formatCents(link.revenueCents)}</td>
                <td className={`${cell} pr-0 text-right whitespace-nowrap text-xs text-[var(--tikkitte-ink-soft)]`}>{ghanaTime(link.createdAt)}</td>
              </tr>)}
              <tr className="font-semibold">
                <th scope="row" className={cell}>No tracking link</th>
                <td className={`${cell} text-right`} />
                <td className={`${cell} text-right tabular-nums`}>{data.unattributed.orders.toLocaleString()}</td>
                <td className={`${cell} text-right tabular-nums`}>{data.unattributed.tickets.toLocaleString()}</td>
                <td className={`${cell} text-right whitespace-nowrap tabular-nums`}>{formatCents(data.unattributed.revenueCents)}</td>
                <td className={`${cell} pr-0`} />
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <div className="overflow-x-auto">
        <h3 className={heading}>Credited orders</h3>
        {data.creditedOrderCount === 0 ? <p className="text-sm">No orders credited to a link yet.</p> : <>
          <p className="mb-2 text-xs text-[var(--tikkitte-ink-soft)]">
            {data.creditedOrderCount > data.recentOrders.length
              ? `Showing the most recent ${data.recentOrders.length} of ${data.creditedOrderCount}. Totals above include all of them.`
              : `All ${data.creditedOrderCount} credited orders, newest first.`}
          </p>
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Orders credited to a tracking link</caption>
            <thead><tr>
              <th scope="col" className="pb-2 pr-4 font-medium">Sold (GMT)</th>
              <th scope="col" className="pb-2 pr-4 font-medium">Link</th>
              <th scope="col" className="pb-2 pr-4 text-right font-medium">Tickets</th>
              <th scope="col" className="pb-2 pr-4 text-right font-medium">Revenue</th>
              <th scope="col" className="pb-2 font-medium">Reference</th>
            </tr></thead>
            <tbody>{data.recentOrders.map((order) => {
              const creditedLate = new Date(order.creditedAt).getTime() - new Date(order.soldAt).getTime() > LATE_CREDIT_MS
              return <tr key={order.reference}>
                <td className={`${cell} whitespace-nowrap tabular-nums`}>{ghanaTime(order.soldAt)}</td>
                <th scope="row" className={`${cell} font-normal`}>
                  {linkById.get(order.linkId)?.name ?? 'Unknown link'}
                  {creditedLate && <span title={`Credited ${ghanaTime(order.creditedAt)} GMT, after the sale. Checkout credits links before payment, so this one was added later.`} className="ml-2 rounded-full bg-[#fff2c7] px-2 py-0.5 text-[10px] font-bold whitespace-nowrap">Credited later</span>}
                </th>
                <td className={`${cell} text-right tabular-nums`}>{order.tickets.toLocaleString()}</td>
                <td className={`${cell} text-right whitespace-nowrap tabular-nums`}>{formatCents(order.revenueCents)}</td>
                <td className={`${cell} pr-0 font-mono text-xs text-[var(--tikkitte-ink-soft)] whitespace-nowrap`}>{order.reference}</td>
              </tr>
            })}</tbody>
          </table>
        </>}
      </div>

      <p className="text-xs leading-5 text-[var(--tikkitte-ink-soft)]">
        Same numbers the organizer sees. A sale counts toward the last tracking link the buyer opened on that device in the 7 days before paying. Refunded and complimentary orders are left out, and revenue excludes the customer service fee. Clicks count every page view, including repeat visits and link previews, so they run high.
      </p>
    </section>
  )
}
