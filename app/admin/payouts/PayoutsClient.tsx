'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import type { Payout, PayoutAccount } from '@/lib/types'
import { markPayoutPaid, setPayoutStatus } from './actions'

export type PayoutAdminRow = {
  payout: Payout
  organizer?: {
    id: string
    display_name: string
    email: string
  }
  account?: PayoutAccount
  event?: { id: string; name: string; slug: string | null }
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

const statusStyles: Record<Payout['status'], string> = {
  pending: 'bg-[#fff2c7] text-[#765400]',
  paid: 'bg-[#e8f4ea] text-[#147a35]',
  cancelled: 'bg-[#f0efeb] text-[#5e5b52]',
  rejected: 'bg-[#fde9e7] text-[#a8322d]',
}

export default function PayoutsClient({ rows }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('pending')
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [decision, setDecision] = useState<{ payoutId: string; status: 'cancelled' | 'rejected' } | null>(null)
  const [reason, setReason] = useState('')
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

  const runDecision = () => {
    if (!decision || !reason.trim()) return
    setError(null)
    setActiveId(decision.payoutId)
    startTransition(async () => {
      const result = await setPayoutStatus(decision.payoutId, decision.status, reason)
      if (!result.ok) {
        setError(result.message)
        setActiveId(null)
        return
      }
      setDecision(null)
      setReason('')
      setActiveId(null)
      router.refresh()
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
          {visibleRows.map(({ payout, organizer, account, event }) => (
            <div key={payout.id} className="px-5 py-5 transition-colors hover:bg-[var(--tikkitte-cream)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{organizer?.display_name ?? 'Unknown organizer'}</p>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] ${statusStyles[payout.status]}`}>{payout.status}</span>
                  </div>
                  <p className="text-sm text-[var(--tikkitte-ink-soft)]">{organizer?.email ?? 'No email available'}</p>

                  <div className="grid gap-4 text-sm text-[var(--tikkitte-ink-soft)] sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]">Amount</p>
                      <p className="create-display mt-1 text-xl text-[var(--tikkitte-ink)]">{formatMoney(Number(payout.amount), 2)}</p>
                    </div>
                    <div>
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]">Event</p>
                      {payout.event_id && event ? (
                        <Link href={`/e/${event.slug ?? payout.event_id}`} target="_blank" rel="noreferrer" className="create-focus mt-1 inline-block max-w-[220px] truncate font-semibold text-[#2565d0] hover:text-[#1f56b5]">{event.name} ↗</Link>
                      ) : payout.legacy_unattributed ? (
                        <p className="mt-1 font-medium text-[var(--tikkitte-ink)]">Legacy · unattributed</p>
                      ) : (
                        <p className="mt-1 text-[var(--tikkitte-ink-faint)]">Event unavailable</p>
                      )}
                      {payout.gross_amount_cents !== null && <p className="mt-1 text-xs">Gross {formatMoney(payout.gross_amount_cents / 100)} · {payout.fee_percent_applied}% fee</p>}
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
                      {payout.status_reason && <p className="mt-1 max-w-[240px] text-xs leading-5 text-[var(--tikkitte-ink-faint)]">{payout.status_reason}</p>}
                    </div>
                  </div>
                </div>

                {payout.status === 'pending' && (
                  <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-[250px] lg:justify-end">
                    <button type="button" onClick={() => runMarkPaid(payout.id)} disabled={isPending && activeId === payout.id} className="create-focus min-h-11 rounded-full bg-[#2e6fe6] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2565d0] disabled:opacity-60">
                      {isPending && activeId === payout.id ? 'Updating…' : 'Mark paid'}
                    </button>
                    <button type="button" onClick={() => { setDecision({ payoutId: payout.id, status: 'rejected' }); setReason('') }} className="create-focus min-h-11 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50">Reject</button>
                    <button type="button" onClick={() => { setDecision({ payoutId: payout.id, status: 'cancelled' }); setReason('') }} className="create-focus min-h-11 rounded-full border border-[var(--tikkitte-cream-border)] px-4 text-sm font-semibold hover:bg-[var(--tikkitte-cream)]">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </section>

      {decision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" onMouseDown={(mouseEvent) => {
          if (mouseEvent.target === mouseEvent.currentTarget && !isPending) setDecision(null)
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="payout-decision-title" className="create-card w-full max-w-md p-6 shadow-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2565d0]">Payout decision</p>
            <h2 id="payout-decision-title" className="create-display mt-1 text-[26px]">{decision.status === 'rejected' ? 'Reject payout' : 'Cancel payout'}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--tikkitte-ink-soft)]">The reserved payments and adjustments will be released so the organizer can request a replacement payout.</p>
            <label className="mt-5 block">
              <span className="mb-1.5 block text-xs font-semibold">Reason</span>
              <textarea value={reason} onChange={(changeEvent) => setReason(changeEvent.target.value)} maxLength={500} rows={3} autoFocus className="create-input w-full resize-y rounded-xl px-3 py-2.5 text-sm outline-none" placeholder="Explain this decision" />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDecision(null)} disabled={isPending} className="create-focus min-h-11 rounded-full border border-[var(--tikkitte-cream-border)] px-5 text-sm font-semibold disabled:opacity-50">Back</button>
              <button type="button" onClick={runDecision} disabled={!reason.trim() || isPending} className="create-focus min-h-11 rounded-full bg-[#191917] px-5 text-sm font-semibold text-white disabled:opacity-45">{isPending ? 'Updating…' : `Confirm ${decision.status}`}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
