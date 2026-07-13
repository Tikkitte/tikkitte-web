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
      <section className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-700">No pending or failed refunds</p>
        <p className="mt-1 text-sm text-gray-400">Refunds needing attention will appear here.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {message && <p className="mb-4 text-sm font-medium text-gray-700">{message}</p>}

      <div className="divide-y divide-gray-100">
        {rows.map(({ payment, eventName }) => {
          const failed = payment.refund_status === 'failed'
          const active = isPending && retryingEventId === payment.event_id

          return (
            <div key={payment.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{eventName}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        failed ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {payment.refund_status?.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
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
                    className="shrink-0 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
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
  )
}
