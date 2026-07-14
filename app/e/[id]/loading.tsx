import { Sk } from '@/components/ui/Skeleton'

export default function PublicEventLoading() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 font-grotesk sm:px-6 sm:py-10 lg:px-12 lg:py-16">
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[55fr_45fr] lg:gap-16">
        <div>
          <div className="mb-8 overflow-hidden rounded-[24px] border border-[#E4DFD1] bg-white shadow-[0_24px_70px_rgba(25,25,23,0.08)]">
            <Sk className="mx-auto aspect-[9/16] w-full max-w-[440px] rounded-none" />
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

        <div className="lg:sticky lg:top-24">
          <div className="rounded-[24px] border border-[#E4DFD1] bg-white p-5 shadow-[0_24px_70px_rgba(25,25,23,0.08)]">
            <Sk className="mb-5 h-10 w-24" />
            <div className="space-y-3">
              <Sk className="h-16 w-full rounded-xl" />
              <Sk className="h-16 w-full rounded-xl" />
              <Sk className="h-12 w-full rounded-xl bg-[#E4DFD1]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
