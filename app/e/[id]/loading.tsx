import { Sk } from '@/components/ui/Skeleton'

export default function PublicEventLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 sm:py-10 lg:px-12 lg:py-16">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[55fr_45fr] lg:gap-16">
        <div>
          <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <Sk className="h-[55vw] max-h-[600px] min-h-[280px] w-full rounded-none" />
            <div className="space-y-4 p-5">
              <Sk className="h-8 w-3/4" />
              <div className="flex gap-3">
                <Sk className="h-4 w-48" />
                <Sk className="h-4 w-32" />
              </div>
              <div className="space-y-2">
                <Sk className="h-4 w-full" />
                <Sk className="h-4 w-full" />
                <Sk className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-20">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Sk className="mb-5 h-10 w-24" />
            <div className="space-y-3">
              <Sk className="h-16 w-full rounded-xl" />
              <Sk className="h-16 w-full rounded-xl" />
              <Sk className="h-12 w-full rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
