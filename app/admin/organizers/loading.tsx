import { Sk } from '@/components/ui/Skeleton'

export default function AdminOrganizersLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-8 w-40" />
        <Sk className="mt-2 h-4 w-56" />
      </div>
      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 p-4">
            <Sk className="h-10 w-10 rounded-lg" />
            <Sk className="h-4 w-48" />
            <Sk className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
