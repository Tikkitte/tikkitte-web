import { Sk } from '@/components/ui/Skeleton'

export default function DashboardHomeLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-8 w-64" />
        <Sk className="mt-2 h-4 w-48" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Sk className="mb-3 h-4 w-20" />
            <Sk className="h-7 w-16" />
          </div>
        ))}
      </div>

      <Sk className="mb-4 mt-8 h-5 w-32" />
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 py-3">
              <Sk className="h-10 w-10 rounded-lg" />
              <Sk className="h-5 w-48" />
              <Sk className="ml-auto h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
