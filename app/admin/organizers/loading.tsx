import { Sk } from '@/components/ui/Skeleton'

export default function AdminOrganizersLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-3 w-32" />
        <Sk className="mt-2 h-10 w-44" />
        <Sk className="mt-2 h-4 w-72 max-w-full" />
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Sk key={index} className="h-24 rounded-[18px] border border-[var(--tikkitte-cream-border)]" />)}</div>
      <div className="create-card divide-y divide-[var(--tikkitte-cream-border)] overflow-hidden">
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
