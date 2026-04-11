'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid } from 'recharts'

type TicketData = {
  label: string
  sold: number
  remaining: number | null
  revenue: number
  price: number
}

const COLORS = ['#1d67ba', '#3b82f6', '#60a5fa', '#93c5fd', '#2563eb', '#1e40af']

export function TicketBarChart({ data }: { data: TicketData[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={data} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '13px',
              padding: '10px 14px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
            formatter={(value) => [String(value), 'Sold']}
            labelStyle={{ color: '#9ca3af', marginBottom: 4 }}
            cursor={{ fill: 'rgba(29, 103, 186, 0.06)' }}
          />
          <Bar dataKey="sold" radius={[8, 8, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RevenueBreakdown({ data }: { data: TicketData[] }) {
  const total = data.reduce((s, d) => s + d.revenue, 0)

  if (total === 0) {
    return (
      <div className="h-52 flex items-center justify-center text-sm text-gray-400">
        No revenue yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((d, i) => {
        const pct = total > 0 ? (d.revenue / total) * 100 : 0
        return (
          <div key={d.label}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700">{d.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-900">
                  GHS {d.revenue.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 w-10 text-right">
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
          </div>
        )
      })}
      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-500">Total revenue</span>
        <span className="text-lg font-bold text-gray-900">GHS {total.toLocaleString()}</span>
      </div>
    </div>
  )
}

type DailyData = {
  date: string
  revenue: number
}

export function RevenueAreaChart({ data }: { data: DailyData[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-sm text-gray-400">
        No transactions yet
      </div>
    )
  }

  const total = data.reduce((s, d) => s + d.revenue, 0)

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-500">Revenue</p>
        <p className="text-3xl font-extrabold text-gray-900">GHS {total.toLocaleString()}</p>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d67ba" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#1d67ba" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '13px',
                padding: '10px 14px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
              formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, 'Revenue']}
              labelStyle={{ color: '#9ca3af', marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#1d67ba"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
