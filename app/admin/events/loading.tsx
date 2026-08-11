import { Sk } from '@/components/ui/Skeleton'

export default function AdminEventsLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-3 w-32" />
        <Sk className="mt-2 h-10 w-36" />
        <Sk className="mt-2 h-4 w-96 max-w-full" />
      </div>
      <div className="create-card divide-y divide-[var(--tikkitte-cream-border)] overflow-hidden">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-5">
            <div className="space-y-2">
              <Sk className="h-4 w-52" />
              <Sk className="h-3 w-36" />
            </div>
            <Sk className="ml-auto h-11 w-28 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
