'use client'

import dynamic from 'next/dynamic'

const LazyDashboardRevenueChart = dynamic(
  () => import('@/components/dashboard/DashboardRevenueChart'),
  {
    ssr: false,
    loading: () => <div className="h-56 animate-pulse rounded-xl bg-gray-100" />,
  }
)

export default LazyDashboardRevenueChart
