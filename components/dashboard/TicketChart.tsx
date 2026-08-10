'use client'

import { useEffect, useRef, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, CartesianGrid } from 'recharts'

type TicketData = {
  label: string
  sold: number
  remaining: number | null
  revenue: number
  price: number
}

const COLORS = ['#2e6fe6', '#191917', '#7899d4', '#4d4b44', '#a7bde5', '#68758b']

function useVisibleChartSize() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationFrame = 0
    const measure = () => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(() => {
        const bounds = container.getBoundingClientRect()
        const nextSize = { width: Math.floor(bounds.width), height: Math.floor(bounds.height) }
        if (nextSize.width > 0 && nextSize.height > 0) {
          setSize((current) => current.width === nextSize.width && current.height === nextSize.height ? current : nextSize)
        }
      })
    }

    const resizeObserver = new ResizeObserver(measure)
    const intersectionObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) measure()
    })

    resizeObserver.observe(container)
    intersectionObserver.observe(container)
    measure()
    window.addEventListener('resize', measure)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      intersectionObserver.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  return { containerRef, ...size }
}

export function TicketBarChart({ data }: { data: TicketData[] }) {
  const { containerRef, width, height } = useVisibleChartSize()

  return (
    <div ref={containerRef} className="h-full min-h-72 w-full" role="img" aria-label="Tickets sold by ticket type">
      {width > 0 && height > 0 ? (
        <BarChart width={width} height={height} data={data} barCategoryGap="28%" margin={{ top: 8, right: 4, bottom: 8, left: -18 }}>
          <CartesianGrid stroke="#e7e2d4" vertical={false} />
          <XAxis
            dataKey="label"
            hide
          />
          <YAxis
            tick={{ fill: '#8a887c', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#191917',
              border: 'none',
              borderRadius: '14px',
              color: '#fff',
              fontSize: '13px',
              padding: '11px 14px',
              boxShadow: '0 14px 30px rgba(25,25,23,0.18)',
            }}
            formatter={(value) => [String(value), 'Sold']}
            labelStyle={{ color: '#a7a59a', marginBottom: 4 }}
            itemStyle={{ color: '#fff' }}
            cursor={{ fill: '#f5f1e7' }}
          />
          <Bar dataKey="sold" radius={[8, 8, 3, 3]} maxBarSize={52}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      ) : <div className="h-full animate-pulse rounded-[18px] bg-[var(--tikkitte-cream)]" aria-hidden="true" />}
    </div>
  )
}

export function RevenueBreakdown({ data }: { data: TicketData[] }) {
  const total = data.reduce((s, d) => s + d.revenue, 0)

  if (total === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-[18px] bg-[var(--tikkitte-cream)] text-sm text-[var(--tikkitte-ink-faint)]">
        No revenue yet
      </div>
    )
  }

  return (
    <div className="space-y-5" role="img" aria-label="Revenue share by ticket type">
      {data.map((d, i) => {
        const pct = total > 0 ? (d.revenue / total) * 100 : 0
        return (
          <div key={d.label}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="truncate text-sm font-semibold text-[var(--tikkitte-ink)]" title={d.label}>{d.label}</span>
              </div>
              <div className="flex shrink-0 items-center gap-2.5">
                <span className="text-sm font-bold text-[var(--tikkitte-ink)]">
                  GHS {d.revenue.toLocaleString()}
                </span>
                <span className="w-11 rounded-full bg-[#e4ecfb] px-2 py-1 text-right text-[10px] font-bold text-[#245dbc]">
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[var(--tikkitte-cream)]">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${pct}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
          </div>
        )
      })}
      <div className="flex items-center justify-between rounded-[18px] bg-[#191917] px-5 py-4 text-white">
        <span className="text-sm text-[#a7a59a]">Total collected</span>
        <span className="create-display text-[22px] text-white">GHS {total.toLocaleString()}</span>
      </div>
    </div>
  )
}

type DailyData = {
  date: string
  revenue: number
}

export function RevenueAreaChart({ data, hideHeader }: { data: DailyData[]; hideHeader?: boolean }) {
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
      {!hideHeader && (
        <div className="mb-4">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-3xl font-extrabold text-gray-900">GHS {total.toLocaleString()}</p>
        </div>
      )}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3d3d3d" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#3d3d3d" stopOpacity={0} />
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
              itemStyle={{ color: '#fff' }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3d3d3d"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
