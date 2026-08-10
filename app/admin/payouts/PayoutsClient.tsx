'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import type { Payout, PayoutAccount } from '@/lib/types'
import { markPayoutPaid } from './actions'

export type PayoutAdminRow = {
  payout: Payout
  organizer?: {
    id: string
    display_name: string
    email: string
  }
  account?: PayoutAccount
}

type Props = {
  rows: PayoutAdminRow[]
}

type Tab = 'pending' | 'paid' | 'all'

function formatMoney(value: number, decimals = 2) {
  return `GHS ${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

function formatDate(value: string | null) {
  if (!value) return 'Not set'
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function methodLabel(method: PayoutAccount['method']) {
  return method === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer'
}

export default function PayoutsClient({ rows }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('pending')
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const counts = useMemo(() => {
    const pending = rows.filter((row) => row.payout.status === 'pending').length
    const paid = rows.filter((row) => row.payout.status === 'paid').length
    return { pending, paid, all: rows.length }
  }, [rows])

  const visibleRows = useMemo(() => {
    if (tab === 'pending') return rows.filter((row) => row.payout.status === 'pending')
    if (tab === 'paid') return rows.filter((row) => row.payout.status === 'paid')
    return rows
  }, [rows, tab])

  const runMarkPaid = (payoutId: string) => {
    setError(null)
    setActiveId(payoutId)
    startTransition(async () => {
      const result = await markPayoutPaid(payoutId)

      if (!result.ok) {
        setError(result.message)
        setActiveId(null)
        return
      }

      router.refresh()
      setActiveId(null)
    })
  }

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'paid', label: 'Paid', count: counts.paid },
    { id: 'all', label: 'All', count: counts.all },
  ]

  const pendingValue = rows
    .filter((row) => row.payout.status === 'pending')
    .reduce((sum, row) => sum + Number(row.payout.amount), 0)

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Payout totals">
        {[
          ['Pending requests', counts.pending.toLocaleString()],
          ['Pending value', formatMoney(pendingValue)],
          ['Completed', counts.paid.toLocaleString()],
        ].map(([label, value]) => <div key={label} className="create-card p-5"><p className="text-[13px] text-[var(--tikkitte-ink-faint)]">{label}</p><p className="create-display mt-1 text-[30px]">{value}</p></div>)}
      </section>

      <section className="create-card overflow-hidden">
      <div className="border-b border-[var(--tikkitte-cream-border)] p-4">
      <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-[var(--tikkitte-cream)] p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={`create-focus min-h-10 whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors ${
              tab === item.id ? 'bg-[#191917] text-white' : 'text-[var(--tikkitte-ink-soft)] hover:bg-white'
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>
      </div>

      {error && <p role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {visibleRows.length === 0 ? (
        <div className="m-5 rounded-[16px] border border-dashed border-[var(--tikkitte-cream-border)] px-5 py-10 text-center">
          <p className="text-sm font-semibold">No payouts in this view</p>
          <p className="mt-1 text-sm text-[var(--tikkitte-ink-faint)]">Payout requests will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--tikkitte-cream-border)]">
          {visibleRows.map(({ payout, organizer, account }) => (
            <div key={payout.id} className="px-5 py-5 transition-colors hover:bg-[var(--tikkitte-cream)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{organizer?.display_name ?? 'Unknown organizer'}</p>
                    {payout.status === 'paid' && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        PAID
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--tikkitte-ink-soft)]">{organizer?.email ?? 'No email available'}</p>

                  <div className="grid gap-4 text-sm text-[var(--tikkitte-ink-soft)] sm:grid-cols-3">
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]">Amount</p>
                      <p className="create-display mt-1 text-xl text-[var(--tikkitte-ink)]">{formatMoney(Number(payout.amount), 2)}</p>
                    </div>
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]">Destination</p>
                      {account ? (
                        <div className="mt-1">
                          <p className="font-semibold text-[var(--tikkitte-ink)]">{account.provider}</p>
                          <p>{account.account_number}</p>
                          <p className="text-gray-400">{account.account_name}</p>
                          <p className="text-xs text-gray-400">{methodLabel(account.method)}</p>
                        </div>
                      ) : (
                        <p className="mt-1 text-gray-400">Account deleted</p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]">Dates</p>
                      <p className="mt-1">Requested {formatDate(payout.created_at)}</p>
                      {payout.status === 'paid' && <p className="text-gray-400">Paid {formatDate(payout.paid_at)}</p>}
                    </div>
                  </div>
                </div>

                {payout.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => runMarkPaid(payout.id)}
                    disabled={isPending && activeId === payout.id}
                    className="create-focus min-h-11 shrink-0 rounded-full bg-[#2e6fe6] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2565d0] disabled:opacity-60"
                  >
                    {isPending && activeId === payout.id ? 'Marking...' : 'Mark as paid'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </section>
    </div>
  )
}
