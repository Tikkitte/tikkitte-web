import { Sk } from '@/components/ui/Skeleton'

export default function DashboardEventsLoading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Sk className="h-8 w-32" />
        <Sk className="h-10 w-32" />
      </div>

      <div className="mb-6 flex gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Sk key={index} className="h-9 w-20 rounded-full" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <Sk className="h-44 w-full rounded-b-none" />
            <div className="space-y-3 p-5">
              <Sk className="h-5 w-3/4" />
              <Sk className="h-4 w-32" />
              <div className="grid grid-cols-2 gap-4">
                <Sk className="h-14 rounded-xl" />
                <Sk className="h-14 rounded-xl" />
              </div>
              <Sk className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
