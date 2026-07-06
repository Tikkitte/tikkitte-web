import { Sk } from '@/components/ui/Skeleton'

export default function AudienceLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-8 w-24" />
        <Sk className="mt-2 h-4 w-48" />
      </div>
      <Sk className="mb-6 h-10 w-64 rounded-xl" />
      <Sk className="mb-5 h-10 w-full rounded-xl" />
      <Sk className="h-96 w-full rounded-2xl border border-gray-100" />
    </div>
  )
}
