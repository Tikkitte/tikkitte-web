'use client'

import { useEffect, useRef, useState } from 'react'

type PaymentRow = {
  reference: string
  amount: number
  status: string
  paidAt: string
  ticketLabel: string
  quantity: number
}

type AttendeeRow = {
  id: string
  name: string
  email: string
  ticketLabel: string
  quantity: number
}

type Props = {
  payments: PaymentRow[]
  attendees: AttendeeRow[]
  fixedTab?: 'transactions' | 'attendees'
}

function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const exportButtonClass = 'create-focus min-h-10 rounded-full border border-[var(--tikkitte-cream-border)] bg-white px-5 text-sm font-semibold text-[#2565d0] transition-colors hover:border-[#b9cff5] hover:bg-[#f4f7fd]'
const inputClass = 'create-input min-h-11 rounded-full pl-5 text-sm'
const pagerButtonClass = 'create-focus min-h-10 rounded-full border border-[var(--tikkitte-cream-border)] px-4 text-sm font-semibold text-[var(--tikkitte-ink-soft)] transition-colors hover:bg-[var(--tikkitte-cream)] disabled:cursor-not-allowed disabled:opacity-40'

const TRANSACTIONS_PAGE_SIZE = 25

export default function EventDetailTabs({ payments, attendees, fixedTab }: Props) {
  const [tab, setTab] = useState<'transactions' | 'attendees'>(fixedTab ?? 'transactions')
  const [search, setSearch] = useState('')
  const [transactionsPage, setTransactionsPage] = useState(1)
  const [expandedReference, setExpandedReference] = useState<string | null>(null)
  const referenceElRef = useRef<HTMLSpanElement | null>(null)
  const normalizedSearch = search.trim().toLowerCase()

  // Select the full reference text once it's rendered unclipped, so a
  // double click both reveals and highlights it for easy copying.
  useEffect(() => {
    if (!expandedReference || !referenceElRef.current) return
    const range = document.createRange()
    range.selectNodeContents(referenceElRef.current)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [expandedReference])

  const totalTransactionPages = Math.max(1, Math.ceil(payments.length / TRANSACTIONS_PAGE_SIZE))
  const currentTransactionsPage = Math.min(transactionsPage, totalTransactionPages)
  const pagedPayments = payments.slice(
    (currentTransactionsPage - 1) * TRANSACTIONS_PAGE_SIZE,
    currentTransactionsPage * TRANSACTIONS_PAGE_SIZE
  )
  const filteredAttendees = attendees.filter((attendee) => (
    !normalizedSearch ||
    attendee.name.toLowerCase().includes(normalizedSearch) ||
    attendee.email.toLowerCase().includes(normalizedSearch)
  ))

  const exportTransactions = () => {
    exportCSV(
      'transactions.csv',
      ['Reference', 'Amount (GHS)', 'Status', 'Ticket', 'Qty', 'Paid on'],
      payments.map((payment) => [
        payment.reference,
        (payment.amount / 100).toFixed(2),
        payment.status,
        payment.ticketLabel,
        String(payment.quantity),
        payment.paidAt,
      ]),
    )
  }

  const exportAttendees = () => {
    exportCSV(
      'attendees.csv',
      ['Name', 'Email', 'Ticket Type', 'Qty'],
      filteredAttendees.map((attendee) => [
        attendee.name,
        attendee.email,
        attendee.ticketLabel,
        String(attendee.quantity),
      ]),
    )
  }

  return (
    <div className="create-card overflow-hidden">
      {/* Tab headers */}
      {!fixedTab && <div className="flex gap-1 border-b border-[var(--tikkitte-cream-border)] p-2">
        <button
          onClick={() => setTab('transactions')}
          className={`create-focus relative min-h-11 flex-1 rounded-full px-4 text-center text-sm font-semibold transition-colors ${
            tab === 'transactions'
              ? 'bg-[#2e6fe6] text-white'
              : 'text-[var(--tikkitte-ink-soft)] hover:bg-[var(--tikkitte-cream)]'
          }`}
        >
          Transactions ({payments.length})
        </button>
        <button
          onClick={() => setTab('attendees')}
          className={`create-focus relative min-h-11 flex-1 rounded-full px-4 text-center text-sm font-semibold transition-colors ${
            tab === 'attendees'
              ? 'bg-[#2e6fe6] text-white'
              : 'text-[var(--tikkitte-ink-soft)] hover:bg-[var(--tikkitte-cream)]'
          }`}
        >
          Attendees ({attendees.length})
        </button>
      </div>}

      {/* Tab content */}
      <div className="p-5">
        {tab === 'transactions' && (
          <>
            {payments.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--tikkitte-ink-faint)]">No transactions yet.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 border-b border-[var(--tikkitte-cream-border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2565d0]">Payment history</p>
                    <h2 className="create-display mt-1 text-[22px]">Transactions</h2>
                  </div>
                  <button type="button" onClick={exportTransactions} className={exportButtonClass}>
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] table-fixed text-sm">
                    <colgroup>
                      <col className="w-[16%]" />
                      <col className="w-[16%]" />
                      <col className="w-[25%]" />
                      <col className="w-[7%]" />
                      <col className="w-[36%]" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-[var(--tikkitte-cream-border)] text-[10.5px] uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]">
                        <th className="py-3 pr-4 text-left font-bold">Amount</th>
                        <th className="px-4 py-3 text-left font-bold">Reference</th>
                        <th className="px-4 py-3 text-left font-bold">Ticket</th>
                        <th className="px-4 py-3 text-right font-bold">Qty</th>
                        <th className="py-3 pl-4 text-right font-bold">Paid on</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedPayments.map((p) => (
                        <tr key={p.reference} className="border-b border-[var(--tikkitte-cream-border)] transition-colors last:border-0 hover:bg-[var(--tikkitte-cream)]">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                p.status === 'refunded' ? 'bg-red-400' : p.status === 'success' ? 'bg-green-500' : p.status === 'free' ? 'bg-blue-400' : 'bg-gray-400'
                              }`} />
                              <span className="truncate font-semibold text-[var(--tikkitte-ink)]">
                                {p.status === 'free' ? 'Free' : `${p.status === 'refunded' ? 'Refunded · ' : ''}GHS ${(p.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-[var(--tikkitte-ink-faint)]">
                            <span
                              ref={expandedReference === p.reference ? referenceElRef : undefined}
                              onDoubleClick={() => setExpandedReference((prev) => (prev === p.reference ? null : p.reference))}
                              title={p.reference}
                              className={
                                expandedReference === p.reference
                                  ? 'block cursor-pointer break-all'
                                  : 'block truncate cursor-pointer'
                              }
                            >
                              {expandedReference === p.reference || p.reference.length <= 10
                                ? p.reference
                                : `${p.reference.slice(0, 10)}…`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[var(--tikkitte-ink-soft)]">
                            <span className="block truncate" title={p.ticketLabel}>{p.ticketLabel}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">{p.quantity}</td>
                          <td className="whitespace-nowrap py-3 pl-4 text-right text-xs text-[var(--tikkitte-ink-faint)]">{p.paidAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalTransactionPages > 1 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <p className="text-xs text-[var(--tikkitte-ink-faint)]">
                      Showing {(currentTransactionsPage - 1) * TRANSACTIONS_PAGE_SIZE + 1}
                      –{Math.min(currentTransactionsPage * TRANSACTIONS_PAGE_SIZE, payments.length)} of {payments.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTransactionsPage((p) => Math.max(1, p - 1))}
                        disabled={currentTransactionsPage === 1}
                        className={pagerButtonClass}
                      >
                        Previous
                      </button>
                      <span className="text-xs text-[var(--tikkitte-ink-faint)]">
                        Page {currentTransactionsPage} of {totalTransactionPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setTransactionsPage((p) => Math.min(totalTransactionPages, p + 1))}
                        disabled={currentTransactionsPage === totalTransactionPages}
                        className={pagerButtonClass}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {tab === 'attendees' && (
          <>
            {attendees.length === 0 ? (
              <p className="py-10 text-center text-sm text-[var(--tikkitte-ink-faint)]">No tickets sold yet.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="w-full sm:max-w-sm">
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      className={inputClass}
                      placeholder="Search by name or email…"
                    />
                    {normalizedSearch && (
                      <p className="mt-2 text-xs text-[var(--tikkitte-ink-faint)]">
                        {filteredAttendees.length} of {attendees.length} attendees
                      </p>
                    )}
                  </div>
                  <button type="button" onClick={exportAttendees} className={exportButtonClass}>
                    Export CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--tikkitte-cream-border)] text-[10.5px] uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]">
                        <th className="py-3 pr-4 text-left font-bold">Name</th>
                        <th className="px-4 py-3 text-left font-bold">Email</th>
                        <th className="px-4 py-3 text-left font-bold">Ticket</th>
                        <th className="py-3 pl-4 text-right font-bold">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendees.map((a) => (
                        <tr key={a.id} className="border-b border-[var(--tikkitte-cream-border)] transition-colors last:border-0 hover:bg-[var(--tikkitte-cream)]">
                          <td className="py-3 pr-4 font-semibold">{a.name}</td>
                          <td className="px-4 py-3 text-[var(--tikkitte-ink-soft)]">{a.email}</td>
                          <td className="px-4 py-3 text-[var(--tikkitte-ink-soft)]">{a.ticketLabel}</td>
                          <td className="py-3 pl-4 text-right font-semibold">{a.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
