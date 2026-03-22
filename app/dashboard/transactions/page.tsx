import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Event, Payment } from '@/lib/types'
import { RevenueAreaChart } from '@/components/dashboard/TicketChart'

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default async function TransactionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all organizer's events
  const { data: events } = await supabase
    .from('event')
    .select('id, name')
    .eq('organizer_id', user.id)

  const eventIds = (events ?? []).map((e: Pick<Event, 'id' | 'name'>) => e.id)
  const eventMap = (events ?? []).reduce((acc: Record<string, string>, e: Pick<Event, 'id' | 'name'>) => {
    acc[e.id] = e.name
    return acc
  }, {})

  // Get all payments for organizer's events
  let allPayments: Payment[] = []
  if (eventIds.length > 0) {
    const { data: successPayments } = await supabase
      .from('payments')
      .select('*')
      .in('event_id', eventIds)
      .eq('status', 'success')
      .order('paid_at', { ascending: false })

    const { data: freePayments } = await supabase
      .from('payments')
      .select('*')
      .in('event_id', eventIds)
      .eq('status', 'free')
      .order('paid_at', { ascending: false })

    allPayments = [...(successPayments ?? []), ...(freePayments ?? [])]
      .sort((a, b) => {
        const da = a.paid_at ? new Date(a.paid_at).getTime() : 0
        const db = b.paid_at ? new Date(b.paid_at).getTime() : 0
        return db - da
      })
  }

  // Build daily revenue chart data (last 30 days)
  const dailyMap: Record<string, number> = {}
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().slice(0, 10)] = 0
  }
  for (const p of allPayments) {
    if (p.paid_at && p.status === 'success') {
      const day = new Date(p.paid_at).toISOString().slice(0, 10)
      if (dailyMap[day] !== undefined) {
        dailyMap[day] += p.amount / 100
      }
    }
  }
  const chartData = Object.entries(dailyMap).map(([date, revenue]) => ({
    date: formatShortDate(date),
    revenue,
  }))

  const totalRevenue = allPayments
    .filter(p => p.status === 'success')
    .reduce((s, p) => s + p.amount / 100, 0)

  const totalTransactions = allPayments.length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">All payments across your events</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total revenue</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">GHS {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total transactions</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{totalTransactions}</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue · Last 30 days</h2>
        <RevenueAreaChart data={chartData} />
      </div>

      {/* Transactions table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">All transactions ({totalTransactions})</h2>
        </div>

        {allPayments.length === 0 ? (
          <div className="p-6">
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No transactions yet. Revenue will appear here once tickets are sold.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <th className="text-left py-3 pl-6 pr-4 font-medium text-gray-500 dark:text-gray-400">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Event</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Reference</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right py-3 pr-6 pl-4 font-medium text-gray-500 dark:text-gray-400">Paid on</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.map((p: Payment) => (
                  <tr key={p.reference} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          p.status === 'success' ? 'bg-green-500' : p.status === 'free' ? 'bg-blue-400' : 'bg-gray-400'
                        }`} />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {p.status === 'free' ? 'Free' : `GHS ${(p.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
                      {eventMap[p.event_id] ?? '—'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 font-mono text-xs">{p.reference}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.status === 'success'
                          ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400'
                          : p.status === 'free'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {p.status === 'success' ? 'Success' : p.status === 'free' ? 'Free' : p.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-right text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {p.paid_at ? formatDateTime(p.paid_at) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
