'use client'

import { useState } from 'react'

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

const exportButtonClass = 'text-sm font-semibold text-[#1d67ba] border border-[#1d67ba] rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors'
const inputClass = 'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d67ba]'

export default function EventDetailTabs({ payments, attendees }: Props) {
  const [tab, setTab] = useState<'transactions' | 'attendees'>('transactions')
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLowerCase()
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
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Tab headers */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setTab('transactions')}
          className={`flex-1 text-sm font-semibold py-3.5 text-center transition-colors relative ${
            tab === 'transactions'
              ? 'text-[#1d67ba]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Transactions ({payments.length})
          {tab === 'transactions' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d67ba]" />
          )}
        </button>
        <button
          onClick={() => setTab('attendees')}
          className={`flex-1 text-sm font-semibold py-3.5 text-center transition-colors relative ${
            tab === 'attendees'
              ? 'text-[#1d67ba]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Attendees ({attendees.length})
          {tab === 'attendees' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1d67ba]" />
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="p-6">
        {tab === 'transactions' && (
          <>
            {payments.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No transactions yet.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button type="button" onClick={exportTransactions} className={exportButtonClass}>
                    Export CSV
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 pr-4 font-medium text-gray-500">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Reference</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Ticket</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">Qty</th>
                        <th className="text-right py-3 pl-4 font-medium text-gray-500">Paid on</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((p) => (
                        <tr key={p.reference} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 pr-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                p.status === 'success' ? 'bg-green-500' : p.status === 'free' ? 'bg-blue-400' : 'bg-gray-400'
                              }`} />
                              <span className="font-semibold text-gray-900">
                                {p.status === 'free' ? 'Free' : `GHS ${(p.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500 font-mono text-xs">{p.reference}</td>
                          <td className="py-3 px-4 text-gray-600">{p.ticketLabel}</td>
                          <td className="py-3 px-4 text-right text-gray-900 font-semibold">{p.quantity}</td>
                          <td className="py-3 pl-4 text-right text-gray-500 text-xs whitespace-nowrap">{p.paidAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'attendees' && (
          <>
            {attendees.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No tickets sold yet.</p>
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
                      <p className="mt-2 text-xs text-gray-400">
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
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 pr-4 font-medium text-gray-500">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-500">Ticket</th>
                        <th className="text-right py-3 pl-4 font-medium text-gray-500">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendees.map((a) => (
                        <tr key={a.id} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 pr-4 font-medium text-gray-900">{a.name}</td>
                          <td className="py-3 px-4 text-gray-500">{a.email}</td>
                          <td className="py-3 px-4 text-gray-600">{a.ticketLabel}</td>
                          <td className="py-3 pl-4 text-right text-gray-900 font-semibold">{a.quantity}</td>
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
