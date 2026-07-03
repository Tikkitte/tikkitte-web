import { Sk } from '@/components/ui/Skeleton'

export default function EventDetailLoading() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Sk className="h-4 w-24" />
        <div className="flex gap-2">
          <Sk className="h-10 w-32" />
          <Sk className="h-10 w-24" />
          <Sk className="h-10 w-24" />
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <Sk className="h-9 w-2/3 max-w-xl" />
        <Sk className="h-6 w-20 rounded-full" />
        <Sk className="h-4 w-64" />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Sk key={index} className="h-9 w-24 rounded-full" />
        ))}
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <Sk className="mb-3 h-4 w-20" />
              <Sk className="h-7 w-16" />
            </div>
          ))}
        </div>
        <Sk className="h-64 w-full rounded-2xl border border-gray-100" />
      </div>
    </div>
  )
}
