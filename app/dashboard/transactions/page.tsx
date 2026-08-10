import { createClient, getAuthedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Event, Payment } from '@/lib/types'
import DashboardRevenueChart from '@/components/dashboard/LazyDashboardRevenueChart'

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

export default async function TransactionsPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
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

  const eligiblePayments = allPayments.filter((payment) => payment.refund_status !== 'success')
  const totalRevenue = eligiblePayments
    .filter(p => p.status === 'success')
    .reduce((s, p) => s + p.amount / 100, 0)

  const totalTransactions = allPayments.length

  return (
    <div>
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#2565d0]">Organizer dashboard</p>
        <h1 className="create-display mt-1 text-[34px]">Transactions</h1>
        <p className="mt-2 text-sm text-[var(--tikkitte-ink-soft)]">All payments across your events.</p>
      </div>

      <div className="mb-5 grid gap-4 sm:grid-cols-2">
        <div className="create-card p-5">
          <p className="text-[13px] text-[var(--tikkitte-ink-faint)]">Gross collected</p>
          <p className="create-display mt-1 text-[30px]">GHS {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="create-card p-5">
          <p className="text-[13px] text-[var(--tikkitte-ink-faint)]">Total transactions</p>
          <p className="create-display mt-1 text-[30px]">{totalTransactions.toLocaleString()}</p>
        </div>
      </div>

      <div className="create-card mb-5 p-5">
        <h2 className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">Revenue</h2>
        <DashboardRevenueChart payments={eligiblePayments.map(({ amount, paid_at }) => ({ amount, paid_at }))} />
      </div>

      <div className="create-card overflow-hidden">
        <div className="border-b border-[var(--tikkitte-cream-border)] px-5 py-4">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">All transactions <span className="ml-1 text-[var(--tikkitte-ink-faint)]">{totalTransactions}</span></h2>
        </div>

        {allPayments.length === 0 ? (
          <div className="p-6">
            <p className="py-8 text-center text-sm text-[var(--tikkitte-ink-faint)]">No transactions yet. Revenue will appear here once tickets are sold.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--tikkitte-cream-border)] text-[10.5px] uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]">
                  <th className="py-3 pl-6 pr-4 text-left font-bold">Amount</th>
                  <th className="px-4 py-3 text-left font-bold">Event</th>
                  <th className="px-4 py-3 text-left font-bold">Reference</th>
                  <th className="px-4 py-3 text-left font-bold">Status</th>
                  <th className="py-3 pl-4 pr-6 text-right font-bold">Paid on</th>
                </tr>
              </thead>
              <tbody>
                {allPayments.map((p: Payment) => (
                  <tr key={p.reference} className="border-b border-[var(--tikkitte-cream-border)] transition-colors last:border-0 hover:bg-[var(--tikkitte-cream)]">
                    <td className="py-3.5 pl-6 pr-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          p.refund_status === 'success' ? 'bg-red-400' : p.status === 'success' ? 'bg-green-500' : p.status === 'free' ? 'bg-blue-400' : 'bg-gray-400'
                        }`} />
                        <span className="font-semibold text-[var(--tikkitte-ink)]">
                          {p.status === 'free' ? 'Free' : `GHS ${(p.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3.5 text-[var(--tikkitte-ink-soft)]">
                      {eventMap[p.event_id] ?? '—'}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-[var(--tikkitte-ink-faint)]">{p.reference}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        p.refund_status === 'success'
                          ? 'bg-red-50 text-red-700'
                          : p.status === 'success'
                          ? 'bg-green-50 text-green-700'
                          : p.status === 'free'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.refund_status === 'success' ? 'Refunded' : p.status === 'success' ? 'Success' : p.status === 'free' ? 'Free' : p.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-3.5 pl-4 pr-6 text-right text-xs text-[var(--tikkitte-ink-faint)]">
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
