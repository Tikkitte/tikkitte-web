import { Sk } from '@/components/ui/Skeleton'

export default function AudienceLoading() {
  return (
    <div>
      <div className="mb-6">
        <Sk className="h-9 w-36" />
        <Sk className="mt-2 h-4 w-80 max-w-full" />
        <Sk className="mt-4 h-12 w-52 rounded-full" />
      </div>
      <Sk className="mb-5 h-10 w-full rounded-xl" />
      <Sk className="h-96 w-full rounded-[18px] border border-[var(--tikkitte-cream-border)]" />
    </div>
  )
}
