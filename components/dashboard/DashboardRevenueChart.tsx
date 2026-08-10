'use client'

import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export type PaymentRow = { amount: number | null; paid_at: string | null }

type Range = '30d' | '3m' | '6m' | '12m' | 'all'
type Granularity = 'daily' | 'weekly' | 'monthly'

const RANGES: { label: string; value: Range }[] = [
  { label: '30D', value: '30d' },
  { label: '3M', value: '3m' },
  { label: '6M', value: '6m' },
  { label: '12M', value: '12m' },
  { label: 'All', value: 'all' },
]

function cutoffDate(range: Range): Date | null {
  const now = new Date()
  switch (range) {
    case '30d': return new Date(now.getTime() - 30 * 86_400_000)
    case '3m': return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
    case '6m': return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    case '12m': return new Date(now.getFullYear(), now.getMonth() - 12, now.getDate())
    case 'all': return null
  }
}

function toBucketKey(d: Date, granularity: Granularity): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  if (granularity === 'monthly') return `${y}-${m}`
  if (granularity === 'weekly') {
    const s = new Date(d)
    s.setDate(d.getDate() - d.getDay())
    return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`
  }
  return `${y}-${m}-${day}`
}

function toLabel(key: string, granularity: Granularity): string {
  const d = new Date(key.length === 7 ? `${key}-01T12:00:00` : `${key}T12:00:00`)
  if (granularity === 'monthly') return d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
  return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
}

function buildChartData(
  payments: PaymentRow[],
  range: Range,
  granularity: Granularity
): { date: string; revenue: number }[] {
  const now = new Date()
  now.setHours(23, 59, 59, 999)
  const cutoff = cutoffDate(range)

  const filtered = payments.filter(p => {
    if (!p.paid_at) return false
    return !cutoff || new Date(p.paid_at) >= cutoff
  })

  const map: Record<string, number> = {}
  for (const p of filtered) {
    if (!p.paid_at) continue
    const key = toBucketKey(new Date(p.paid_at), granularity)
    map[key] = (map[key] ?? 0) + (p.amount ?? 0) / 100
  }

  let rangeStart: Date
  if (cutoff) {
    rangeStart = new Date(cutoff)
  } else if (filtered.length > 0) {
    rangeStart = new Date(Math.min(...filtered.map(p => new Date(p.paid_at!).getTime())))
  } else {
    return []
  }

  const result: { date: string; revenue: number }[] = []
  const cur = new Date(rangeStart)

  if (granularity === 'monthly') {
    cur.setDate(1)
    cur.setHours(0, 0, 0, 0)
    while (cur <= now) {
      const key = toBucketKey(cur, 'monthly')
      result.push({ date: toLabel(key, 'monthly'), revenue: map[key] ?? 0 })
      cur.setMonth(cur.getMonth() + 1)
    }
  } else if (granularity === 'weekly') {
    cur.setDate(cur.getDate() - cur.getDay())
    cur.setHours(0, 0, 0, 0)
    while (cur <= now) {
      const key = toBucketKey(cur, 'weekly')
      result.push({ date: toLabel(key, 'weekly'), revenue: map[key] ?? 0 })
      cur.setDate(cur.getDate() + 7)
    }
  } else {
    cur.setHours(0, 0, 0, 0)
    while (cur <= now) {
      const key = toBucketKey(cur, 'daily')
      result.push({ date: toLabel(key, 'daily'), revenue: map[key] ?? 0 })
      cur.setDate(cur.getDate() + 1)
    }
  }

  return result
}

export default function DashboardRevenueChart({ payments }: { payments: PaymentRow[] }) {
  const [range, setRange] = useState<Range>('6m')
  const [granularity, setGranularity] = useState<Granularity>('monthly')

  const data = useMemo(
    () => buildChartData(payments, range, granularity),
    [payments, range, granularity]
  )

  const selectRange = (nextRange: Range) => {
    setRange(nextRange)
    setGranularity(nextRange === '30d' ? 'daily' : nextRange === '3m' ? 'weekly' : 'monthly')
  }

  if (payments.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-gray-400">
        No transactions yet
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-1">
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => selectRange(r.value)}
              aria-pressed={range === r.value}
              className={`create-focus rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                range === r.value
                  ? 'bg-[#191917] text-white'
                  : 'text-[#8a887c] hover:text-[#191917]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

      </div>

      {data.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-gray-400">
          No transactions in this period
        </div>
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="dashRevGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2e6fe6" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#2e6fe6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="1 4" stroke="#e7e2d4" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#8a887c', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#8a887c', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                }}
                itemStyle={{ color: '#ffffff', fontSize: 13 }}
                labelStyle={{ color: '#d1d5db', fontSize: 11, marginBottom: 4 }}
                formatter={(value) => [
                  `GHS ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  'Collected',
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2e6fe6"
                strokeWidth={2.5}
                fill="url(#dashRevGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#2e6fe6', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
