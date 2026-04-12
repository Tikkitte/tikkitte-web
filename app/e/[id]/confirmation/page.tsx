import { Suspense } from 'react'
import ConfirmationContent from './ConfirmationContent'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ reference?: string; trxref?: string }>
}

function LoadingFallback() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 text-gray-600 font-medium">
        <svg className="animate-spin h-5 w-5 text-[#1d67ba]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Verifying your payment...
      </div>
    </div>
  )
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { id: eventId } = await params
  const { reference, trxref } = await searchParams
  const ref = reference || trxref || null

  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmationContent eventId={eventId} reference={ref} />
    </Suspense>
  )
}
