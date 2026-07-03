import Nav from '@/components/landing/Nav'
import Footer from '@/components/landing/Footer'
import { Sk } from '@/components/ui/Skeleton'

export default function EventsLoading() {
  return (
    <main className="flex min-h-full flex-col">
      <Nav />
      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-12 sm:py-20 lg:px-12">
          <Sk className="mb-8 h-8 w-48" />
          <Sk className="h-10 w-72 max-w-full" />
          <Sk className="mt-4 h-5 w-96 max-w-full" />
        </div>
      </div>
      <div className="flex-1 bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-12 lg:px-12">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <Sk className="h-44 w-full rounded-b-none" />
                <div className="space-y-2 p-5">
                  <Sk className="h-5 w-3/4" />
                  <Sk className="h-4 w-24" />
                  <Sk className="h-4 w-32" />
                  <Sk className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
