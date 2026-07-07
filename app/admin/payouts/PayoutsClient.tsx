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

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 inline-flex w-fit items-center gap-1 rounded-xl bg-gray-100 p-1">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === item.id ? 'bg-[#3d3d3d]/10 text-[#3d3d3d]' : 'text-gray-500 hover:bg-white'
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {visibleRows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-5 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">No payouts in this view</p>
          <p className="mt-1 text-sm text-gray-400">Payout requests will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {visibleRows.map(({ payout, organizer, account }) => (
            <div key={payout.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{organizer?.display_name ?? 'Unknown organizer'}</p>
                    {payout.status === 'paid' && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        PAID
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{organizer?.email ?? 'No email available'}</p>

                  <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Amount</p>
                      <p className="mt-1 font-semibold text-gray-900">{formatMoney(Number(payout.amount), 2)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Destination</p>
                      {account ? (
                        <div className="mt-1">
                          <p className="font-semibold text-gray-900">{account.provider}</p>
                          <p>{account.account_number}</p>
                          <p className="text-gray-400">{account.account_name}</p>
                          <p className="text-xs text-gray-400">{methodLabel(account.method)}</p>
                        </div>
                      ) : (
                        <p className="mt-1 text-gray-400">Account deleted</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Dates</p>
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
                    className="shrink-0 rounded-lg bg-[#3d3d3d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a] disabled:opacity-60"
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
  )
}
