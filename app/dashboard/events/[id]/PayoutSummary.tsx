import RequestPayoutButton from '@/components/dashboard/RequestPayoutButton'
import type { EventOutstandingPayout, Payout } from '@/lib/types'

type Props = {
  eventId: string
  breakdown: EventOutstandingPayout
  hasPayoutAccount: boolean
  payouts: Payout[]
}

function formatMoney(value: number) {
  return `GHS ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatCents(value: number) {
  return formatMoney(value / 100)
}

function formatDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const statusStyles: Record<Payout['status'], string> = {
  pending: 'bg-[#fff2c7] text-[#765400]',
  paid: 'bg-[#e8f4ea] text-[#147a35]',
  cancelled: 'bg-[#f0efeb] text-[#5e5b52]',
  rejected: 'bg-[#fde9e7] text-[#a8322d]',
}

export default function PayoutSummary({ eventId, breakdown, hasPayoutAccount, payouts }: Props) {
  const hasPendingPayout = payouts.some((payout) => payout.status === 'pending')
  const hasOutstandingActivity = breakdown.outstanding_gross_cents !== 0
    || breakdown.unconsumed_adjustments_cents !== 0

  return (
    <section className="create-card overflow-hidden" aria-labelledby="event-payout-heading">
      <div className="border-b border-[var(--tikkitte-cream-border)] px-5 py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2565d0]">Event settlement</p>
        <h2 id="event-payout-heading" className="create-display mt-1 text-[22px]">Payout</h2>
      </div>

      <div className="p-5">
        <dl className="text-[13px]">
          <div className="flex items-center justify-between gap-4 py-1.5 text-[var(--tikkitte-ink-soft)]">
            <dt>Unsettled ticket sales</dt>
            <dd className="font-medium tabular-nums">{formatCents(breakdown.outstanding_gross_cents)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-1.5 text-[var(--tikkitte-ink-soft)]">
            <dt>Platform fee ({breakdown.fee_percent}%)</dt>
            <dd className="font-medium tabular-nums">−{formatCents(breakdown.fee_cents)}</dd>
          </div>
          {breakdown.unconsumed_adjustments_cents !== 0 && (
            <div className="flex items-center justify-between gap-4 py-1.5 text-[var(--tikkitte-ink-soft)]">
              <dt>Settlement adjustments</dt>
              <dd className="font-medium tabular-nums">
                {breakdown.unconsumed_adjustments_cents > 0 ? '+' : '−'}
                {formatCents(Math.abs(breakdown.unconsumed_adjustments_cents))}
              </dd>
            </div>
          )}
          <div className="mt-2 flex items-baseline justify-between gap-4 border-t border-[var(--tikkitte-cream-border)] pt-3">
            <dt className="font-semibold">Available to request</dt>
            <dd className="create-display text-[23px] tabular-nums">{formatCents(breakdown.net_cents)}</dd>
          </div>
        </dl>

        <div className="mt-5">
          {hasPendingPayout ? (
            <div className="rounded-xl bg-[#fff8df] px-4 py-3 text-center text-xs font-semibold text-[#765400]">
              A payout for this event is pending review.
            </div>
          ) : breakdown.net_cents >= 1000 ? (
            <RequestPayoutButton eventId={eventId} breakdown={breakdown} hasPayoutAccount={hasPayoutAccount} />
          ) : (
            <p className="rounded-xl bg-[var(--tikkitte-cream)] px-4 py-3 text-center text-xs leading-5 text-[var(--tikkitte-ink-soft)]">
              {!hasOutstandingActivity
                ? 'No unsettled sales are available for payout yet.'
                : breakdown.net_cents < 0
                ? 'Refund adjustments will be applied to this event’s future sales.'
                : 'A minimum of GHS 10 is required to request a payout.'}
            </p>
          )}
          <p className="mt-3 text-center text-[11px] leading-5 text-[var(--tikkitte-ink-faint)]">Payouts normally arrive within 3–5 business days after approval.</p>
        </div>
      </div>

      {payouts.length > 0 && (
        <div className="border-t border-[var(--tikkitte-cream-border)] px-5 py-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">Payout history</h3>
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between gap-4 rounded-xl bg-[var(--tikkitte-cream)] px-4 py-3.5 text-sm">
                <div className="min-w-0">
                  <p className="font-semibold tabular-nums">{formatMoney(Number(payout.amount))}</p>
                  <p className="mt-1 text-[11px] text-[var(--tikkitte-ink-faint)]">
                    {formatDate(payout.status === 'paid' ? payout.paid_at : payout.created_at)}
                  </p>
                  {payout.status_reason && (
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-[var(--tikkitte-ink-soft)]">{payout.status_reason}</p>
                  )}
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${statusStyles[payout.status]}`}>
                  {payout.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
