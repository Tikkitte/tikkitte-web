'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts'

type TicketData = {
  label: string
  sold: number
  remaining: number | null
  revenue: number
  price: number
}

export function TicketBarChart({ data }: { data: TicketData[] }) {
  const colors = ['#1d67ba', '#3b82f6', '#60a5fa', '#93c5fd']

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="20%">
          <XAxis
            dataKey="label"
            tick={{ fill: '#9ca3af', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#9ca3af', fontSize: 13 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '13px',
            }}
            formatter={(value: number, name: string) => [value, name === 'sold' ? 'Sold' : name]}
            labelStyle={{ color: '#9ca3af', marginBottom: 4 }}
          />
          <Bar dataKey="sold" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RevenueDonut({ data }: { data: TicketData[] }) {
  const colors = ['#1d67ba', '#3b82f6', '#60a5fa', '#93c5fd']
  const total = data.reduce((s, d) => s + d.revenue, 0)
  const pieData = data.filter(d => d.revenue > 0)

  if (total === 0) {
    return (
      <div className="h-52 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
        No revenue yet
      </div>
    )
  }

  return (
    <div className="h-52 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            dataKey="revenue"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            strokeWidth={2}
            stroke="transparent"
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '13px',
            }}
            formatter={(value: number) => [`GHS ${value.toLocaleString()}`, 'Revenue']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">GHS {total.toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}
