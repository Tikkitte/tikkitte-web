'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { Payment } from '@/lib/types'
import { retryEventRefunds } from './actions'

export type RefundPayment = Pick<
  Payment,
  | 'id'
  | 'reference'
  | 'event_id'
  | 'user_id'
  | 'amount'
  | 'refund_status'
  | 'refund_reference'
  | 'refunded_at'
  | 'refund_error'
> & { created_at: string }

export type RefundAdminRow = {
  payment: RefundPayment
  eventName: string
}

function formatMoney(value: number) {
  return `GHS ${(value / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function RefundsClient({ rows }: { rows: RefundAdminRow[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [retryingEventId, setRetryingEventId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleRetry = (eventId: string) => {
    setMessage(null)
    setRetryingEventId(eventId)
    startTransition(async () => {
      const result = await retryEventRefunds(eventId)
      setMessage(result.ok ? 'Retry submitted. Refreshing status...' : result.message)
      setRetryingEventId(null)
      if (result.ok) router.refresh()
    })
  }

  if (rows.length === 0) {
    return (
      <section className="create-card p-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#d9e4fa] text-[#2565d0]" aria-hidden="true">✓</div>
        <p className="mt-4 text-sm font-semibold">No pending or failed refunds</p>
        <p className="mt-1 text-sm text-[var(--tikkitte-ink-faint)]">Refunds needing attention will appear here.</p>
      </section>
    )
  }

  const failedCount = rows.filter((row) => row.payment.refund_status === 'failed').length
  const pendingCount = rows.length - failedCount
  const affectedValue = rows.reduce((sum, row) => sum + row.payment.amount, 0)

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Refund totals">
        {[
          ['Failed', failedCount.toLocaleString()],
          ['Pending', pendingCount.toLocaleString()],
          ['Value affected', formatMoney(affectedValue)],
        ].map(([label, value]) => <div key={label} className="create-card p-5"><p className="text-[13px] text-[var(--tikkitte-ink-faint)]">{label}</p><p className="create-display mt-1 text-[30px]">{value}</p></div>)}
      </section>

      <section className="create-card overflow-hidden">
      {message && <p role="status" className="m-4 rounded-xl bg-[var(--tikkitte-cream)] px-4 py-3 text-sm font-medium">{message}</p>}

      <div className="divide-y divide-[var(--tikkitte-cream-border)]">
        {rows.map(({ payment, eventName }) => {
          const failed = payment.refund_status === 'failed'
          const active = isPending && retryingEventId === payment.event_id

          return (
            <div key={payment.id} className="px-5 py-5 transition-colors hover:bg-[var(--tikkitte-cream)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{eventName}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        failed ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {payment.refund_status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--tikkitte-ink-soft)]">
                    Ref {payment.reference} &middot; {formatMoney(payment.amount)}
                  </p>
                  {payment.refund_error && (
                    <p className="mt-1 text-sm text-red-500">{payment.refund_error}</p>
                  )}
                </div>

                {failed ? (
                  <button
                    type="button"
                    onClick={() => handleRetry(payment.event_id)}
                    disabled={active}
                    className="create-focus min-h-11 shrink-0 rounded-full border border-[var(--tikkitte-cream-border)] bg-white px-6 text-sm font-semibold transition-colors hover:bg-[var(--tikkitte-cream)] disabled:opacity-50"
                  >
                    {active ? 'Retrying...' : 'Retry'}
                  </button>
                ) : (
                  <span className="shrink-0 text-sm font-medium text-amber-700">Awaiting Paystack</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
      </section>
    </div>
  )
}
