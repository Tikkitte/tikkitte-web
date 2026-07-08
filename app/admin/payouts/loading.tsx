import { Sk } from '@/components/ui/Skeleton'

export default function AdminPayoutsLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-8 w-32" />
        <Sk className="mt-2 h-4 w-64" />
      </div>
      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-4">
            <div className="space-y-2">
              <Sk className="h-4 w-44" />
              <Sk className="h-3 w-28" />
            </div>
            <Sk className="ml-auto h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
