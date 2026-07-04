'use client'

import dynamic from 'next/dynamic'

export const TicketBarChart = dynamic(
  () => import('@/components/dashboard/TicketChart').then(m => ({ default: m.TicketBarChart })),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100" />,
  }
)

export const RevenueBreakdown = dynamic(
  () => import('@/components/dashboard/TicketChart').then(m => ({ default: m.RevenueBreakdown })),
  {
    ssr: false,
    loading: () => <div className="h-40 animate-pulse rounded-xl bg-gray-100" />,
  }
)
