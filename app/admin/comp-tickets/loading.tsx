import { Sk } from '@/components/ui/Skeleton'

export default function AdminCompTicketsLoading() {
  return (
    <div>
      <div className="mb-8">
        <Sk className="h-3 w-32" />
        <Sk className="mt-2 h-10 w-64" />
        <Sk className="mt-2 h-4 w-full max-w-xl" />
      </div>

      <div className="create-card mb-6 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Sk className="h-4 w-16" />
            <Sk className="mt-2 h-11 w-full" />
            <Sk className="mt-2 h-3 w-64 max-w-full" />
          </div>
          <Sk className="h-20 w-full rounded-xl" />
        </div>
      </div>

      <div className="create-card p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Sk className="h-4 w-40" />
            <Sk className="mt-2 h-3 w-72 max-w-full" />
          </div>
          <Sk className="h-10 w-36" />
        </div>
        <Sk className="mt-5 h-11 w-full" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Sk key={index} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
