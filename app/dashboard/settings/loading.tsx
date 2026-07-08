import { Sk } from '@/components/ui/Skeleton'

export default function SettingsLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-8 w-40" />
        <Sk className="mt-2 h-4 w-64" />
      </div>
      <div className="max-w-6xl grid grid-cols-1 gap-6 lg:grid-cols-[1fr_460px] lg:items-start">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <Sk className="h-5 w-32" />
          <Sk className="h-10 w-full" />
          <Sk className="h-10 w-full" />
          <Sk className="h-24 w-full" />
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <Sk className="h-5 w-40" />
          <Sk className="h-16 w-full" />
        </div>
      </div>
    </div>
  )
}
