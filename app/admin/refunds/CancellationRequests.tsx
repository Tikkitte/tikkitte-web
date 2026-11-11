'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'
import { reviewEventCancellation } from './actions'

export type CancellationRequest = {
  eventId: string
  eventName: string
  eventDate: string
  organizerName: string | null
  organizerEmail: string | null
  requestedAt: string
  paidOutCents: number
  pendingPayout: { id: string; kind: string; amountCents: number } | null
  refundableOrders: number
  refundableCents: number
}
const money = (cents: number) => `GHS ${(Number(cents) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function CancellationRequests({ requests }: { requests: CancellationRequest[] }) {
  const router = useRouter()
  const [review, setReview] = useState<{ request: CancellationRequest; decision: 'approve' | 'decline' } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  return <section className="create-card mb-8 p-5">
    <h2 className="create-display mb-4 text-xl">Cancellation requests</h2>
    {requests.length === 0 && <p className="text-sm text-[var(--tikkitte-ink-soft)]">No cancellation requests awaiting review.</p>}
    <div className="space-y-4">{requests.map((request) => <div key={request.eventId} className="rounded-xl border border-[var(--tikkitte-cream-border)] p-4">
      <h3 className="font-semibold">{request.eventName}</h3>
      <p className="mt-1 text-sm">{request.organizerName ?? 'Organizer'} {request.organizerEmail && `(${request.organizerEmail})`}</p>
      <p className="mt-1 text-xs text-[var(--tikkitte-ink-soft)]">Requested {new Date(request.requestedAt).toLocaleString()}</p>
      <p className="mt-3 text-sm">Paid to organizer: {money(request.paidOutCents)}</p>
      <p className="text-sm">Orders to refund: {request.refundableOrders}, {money(request.refundableCents)}</p>
      {request.pendingPayout && <p className="mt-2 text-sm text-[#765400]">Pending {request.pendingPayout.kind} payout: {money(request.pendingPayout.amountCents)}. <Link className="underline" href="/admin/payouts">Resolve the pending payout first</Link>.</p>}
      <div className="mt-4 flex gap-3">
        <button type="button" disabled={Boolean(request.pendingPayout) || pending} onClick={() => { setError(null); setReview({ request, decision: 'approve' }) }} className="create-focus min-h-11 rounded-full bg-[#191917] px-5 text-sm font-semibold text-white disabled:opacity-45">Approve and refund</button>
        <button type="button" disabled={pending} onClick={() => { setError(null); setReview({ request, decision: 'decline' }) }} className="create-focus min-h-11 rounded-full border border-[var(--tikkitte-cream-border)] px-5 text-sm font-semibold">Decline</button>
      </div>
    </div>)}</div>
    <ConfirmDialog open={review !== null} title={review?.decision === 'approve' ? 'Approve cancellation' : 'Decline cancellation'}
      description={review?.decision === 'approve' ? `This cancels ${review.request.eventName}, notifies ticket holders and refunds ${review.request.refundableOrders} orders totalling ${money(review.request.refundableCents)} through Paystack. This can't be undone.` : 'The event goes back on sale. Tell the organizer yourself.'}
      confirmLabel={review?.decision === 'approve' ? 'Approve and refund' : 'Decline'} danger={review?.decision === 'approve'} loading={pending} error={error}
      onCancel={() => { setReview(null); setError(null) }} onConfirm={() => {
        if (!review) return
        startTransition(async () => {
          const result = await reviewEventCancellation(review.request.eventId, review.decision)
          if (!result.ok) { setError(result.message); return }
          setReview(null)
          router.refresh()
        })
      }} />
  </section>
}
