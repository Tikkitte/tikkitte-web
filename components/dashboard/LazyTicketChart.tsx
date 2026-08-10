'use client'

import dynamic from 'next/dynamic'

export const TicketBarChart = dynamic(
  () => import('@/components/dashboard/TicketChart').then(m => ({ default: m.TicketBarChart })),
  {
    ssr: false,
    loading: () => <div className="h-72 animate-pulse rounded-[18px] bg-[var(--tikkitte-cream)]" />,
  }
)

export const RevenueBreakdown = dynamic(
  () => import('@/components/dashboard/TicketChart').then(m => ({ default: m.RevenueBreakdown })),
  {
    ssr: false,
    loading: () => <div className="h-72 animate-pulse rounded-[18px] bg-[var(--tikkitte-cream)]" />,
  }
)
