import { Sk } from '@/components/ui/Skeleton'

export default function TicketLoading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 space-y-3">
        <Sk className="h-10 w-3/4" />
        <Sk className="h-4 w-40" />
        <Sk className="h-4 w-56" />
      </div>
      <h2 className="mb-1 text-sm font-bold uppercase tracking-[0.16em] text-[#2565D0]">
        Your Tickets
      </h2>
      <p className="mb-4 text-xs text-[#8a887c]">Loading your tickets…</p>
      <div className="rounded-[24px] border border-[#E4DFD1] bg-white p-5">
        <Sk className="mb-4 h-5 w-1/2" />
        <Sk className="mx-auto h-48 w-48 rounded-xl" />
      </div>
    </main>
  )
}
