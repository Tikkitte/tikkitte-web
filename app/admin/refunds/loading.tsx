import { Sk } from '@/components/ui/Skeleton'

export default function AdminRefundsLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-3 w-32" />
        <Sk className="mt-2 h-10 w-32" />
        <Sk className="mt-2 h-4 w-full max-w-xl" />
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => <Sk key={index} className="h-24 rounded-[18px] border border-[var(--tikkitte-cream-border)]" />)}
      </div>
      <div className="create-card divide-y divide-[var(--tikkitte-cream-border)] overflow-hidden">
        {Array.from({ length: 4 }).map((_, index) => <Sk key={index} className="h-20 rounded-none" />)}
      </div>
    </div>
  )
}
