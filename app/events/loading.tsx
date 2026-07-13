import Nav from '@/components/landing/Nav'
import Footer from '@/components/landing/Footer'
import { Sk } from '@/components/ui/Skeleton'

export default function EventsLoading() {
  return (
    <main className="flex min-h-full flex-col bg-[#F4F2EC] font-grotesk">
      <Nav />
      <div className="mx-auto max-w-[1100px] px-5 pt-[clamp(36px,6vh,72px)] lg:px-14">
        <Sk className="h-4 w-32" />
        <Sk className="mt-4 h-12 w-72 max-w-full" />
        <Sk className="mt-4 h-5 w-96 max-w-full" />
      </div>
      <div className="mx-auto w-full max-w-[1100px] px-5 pt-11 lg:px-14">
        <div className="flex flex-col">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-6 border-b border-[#E7E2D4] py-[22px]">
              <Sk className="h-[110px] w-[88px] flex-shrink-0 rounded-xl" />
              <div className="flex flex-1 flex-col gap-2">
                <Sk className="h-3 w-24" />
                <Sk className="h-6 w-2/3" />
                <Sk className="h-4 w-40" />
              </div>
              <Sk className="ml-auto h-10 w-28 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}
