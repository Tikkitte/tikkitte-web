import { Sk } from '@/components/ui/Skeleton'

export default function AudienceMarketingLoading() {
  return (
    <div>
      <div className="mb-6">
        <Sk className="h-9 w-36" />
        <Sk className="mt-2 h-4 w-80 max-w-full" />
        <Sk className="mt-4 h-12 w-52 rounded-full" />
      </div>

      <div className="create-card overflow-hidden">
        <Sk className="h-16 rounded-none" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Sk key={index} className="h-14 rounded-none border-t border-[var(--tikkitte-cream-border)]" />
        ))}
      </div>
    </div>
  )
}
