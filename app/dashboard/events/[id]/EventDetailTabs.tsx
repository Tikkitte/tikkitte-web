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

export default function EventDetailTabs({ payments, attendees }: Props) {
  const [tab, setTab] = useState<'transactions' | 'attendees'>('transactions')

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
      {/* Tab headers */}
      <div className="flex border-b border-gray-100 dark:border-slate-800">
        <button
          onClick={() => setTab('transactions')}
          className={`flex-1 text-sm font-semibold py-3.5 text-center transition-colors relative ${
            tab === 'transactions'
              ? 'text-[#1d67ba]'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
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
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
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
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No transactions yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800">
                      <th className="text-left py-3 pr-4 font-medium text-gray-500 dark:text-slate-400">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-slate-400">Reference</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-slate-400">Ticket</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-slate-400">Qty</th>
                      <th className="text-right py-3 pl-4 font-medium text-gray-500 dark:text-slate-400">Paid on</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.reference} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              p.status === 'success' ? 'bg-green-500' : p.status === 'free' ? 'bg-blue-400' : 'bg-gray-400'
                            }`} />
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {p.status === 'free' ? 'Free' : `GHS ${(p.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-slate-400 font-mono text-xs">{p.reference}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-slate-300">{p.ticketLabel}</td>
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-white font-semibold">{p.quantity}</td>
                        <td className="py-3 pl-4 text-right text-gray-500 dark:text-slate-400 text-xs whitespace-nowrap">{p.paidAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {tab === 'attendees' && (
          <>
            {attendees.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-8">No tickets sold yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-800">
                      <th className="text-left py-3 pr-4 font-medium text-gray-500 dark:text-slate-400">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-slate-400">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-slate-400">Ticket</th>
                      <th className="text-right py-3 pl-4 font-medium text-gray-500 dark:text-slate-400">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((a) => (
                      <tr key={a.id} className="border-b border-gray-50 dark:border-slate-800/50 last:border-0">
                        <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">{a.name}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-slate-400">{a.email}</td>
                        <td className="py-3 px-4 text-gray-600 dark:text-slate-300">{a.ticketLabel}</td>
                        <td className="py-3 pl-4 text-right text-gray-900 dark:text-white font-semibold">{a.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
