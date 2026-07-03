import Nav from '@/components/landing/Nav'
import { Sk } from '@/components/ui/Skeleton'

export default function OrganizerLoading() {
  return (
    <>
      <Nav />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-10">
          <Sk className="mb-4 h-16 w-16 rounded-full" />
          <Sk className="h-8 w-48" />
          <div className="mt-3 max-w-2xl space-y-2">
            <Sk className="h-4 w-full" />
            <Sk className="h-4 w-2/3" />
          </div>
        </section>

        <section>
          <Sk className="mb-5 h-5 w-40" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <Sk className="h-44 w-full rounded-b-none rounded-t-2xl" />
                <Sk className="mx-5 mt-5 h-5 w-3/4" />
                <Sk className="mx-5 mt-2 h-4 w-24" />
                <Sk className="mx-5 mb-5 mt-1 h-4 w-32" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
