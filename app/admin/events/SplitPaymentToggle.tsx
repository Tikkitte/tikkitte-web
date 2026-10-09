'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setEventSplitEnabled } from './actions'

export default function SplitPaymentToggle({ eventId, enabled, ready }: { eventId: string; enabled: boolean; ready: boolean }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  return (
    <div className="mt-3 space-y-2 text-xs">
      <p className="text-[var(--tikkitte-ink-soft)]">Split payments: <strong>{enabled ? 'On' : 'Off'}</strong>. Changes apply to new checkouts; existing transactions keep their settlement terms.</p>
      {!enabled && <p className="text-[var(--tikkitte-ink-soft)]">Enable after verifying a test transaction and refund handling with Paystack. Keep currently selling events on their existing flow.</p>}
      <button type="button" disabled={pending || (!enabled && !ready)} className="create-focus min-h-9 rounded-full border border-[var(--tikkitte-cream-border)] bg-white px-4 font-semibold disabled:opacity-60" onClick={() => {
        setError(null)
        startTransition(async () => {
          const result = await setEventSplitEnabled(eventId, !enabled)
          if (!result.ok) setError(result.message)
          else router.refresh()
        })
      }}>{pending ? 'Saving…' : enabled ? 'Stop splitting new sales' : 'Enable split payments'}</button>
      {!enabled && !ready && <p>Create the organizer’s Paystack subaccount and configure the event fee first.</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
    </div>
  )
}
