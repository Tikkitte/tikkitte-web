import { Sk } from '@/components/ui/Skeleton'

export default function AudienceMarketingLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-8 w-24" />
        <Sk className="mt-2 h-4 w-48" />
      </div>
      <Sk className="mb-6 h-10 w-64 rounded-xl" />

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <Sk className="h-10 rounded-none bg-gray-50" />
        {Array.from({ length: 3 }).map((_, index) => (
          <Sk key={index} className="h-14 rounded-none border-t border-gray-50" />
        ))}
      </div>
    </div>
  )
}
