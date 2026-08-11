'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { requestPayout } from '@/app/dashboard/payout-actions'
import type { EventOutstandingPayout } from '@/lib/types'

type Props = {
  eventId: string
  breakdown: EventOutstandingPayout
  hasPayoutAccount: boolean
  onClose: () => void
}

function formatMoneyFromCents(value: number) {
  return `GHS ${(value / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function RequestPayoutModal({ eventId, breakdown, hasPayoutAccount, onClose }: Props) {
  const router = useRouter()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const canSubmit = hasPayoutAccount && breakdown.net_cents >= 1000 && !isPending && !success

  useEffect(() => {
    closeButtonRef.current?.focus()

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isPending) onClose()
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isPending, onClose])

  useEffect(() => {
    if (!success) return
    const timer = window.setTimeout(() => {
      router.refresh()
      onClose()
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [onClose, router, success])

  const submit = () => {
    if (!canSubmit) return

    setServerError(null)
    startTransition(async () => {
      const result = await requestPayout(eventId)
      if (!result.ok) {
        setServerError(result.message)
        return
      }
      setSuccess(true)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isPending) onClose()
    }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-payout-title"
        className="create-card w-full max-w-lg p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#2565d0]">Full event settlement</p>
            <h2 id="request-payout-title" className="create-display mt-1 text-[26px]">Request payout</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="create-focus -mr-2 -mt-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tikkitte-ink-faint)] hover:bg-[var(--tikkitte-cream)] hover:text-[var(--tikkitte-ink)] disabled:opacity-50"
            aria-label="Close payout request"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="py-10 text-center" role="status">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f4ea] text-[#147a35]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 13 4 4L19 7" />
              </svg>
            </div>
            <p className="font-semibold">Payout requested</p>
            <p className="mt-1 text-sm text-[var(--tikkitte-ink-soft)]">We&apos;ll email you when the status changes.</p>
          </div>
        ) : (
          <>
            <dl className="mt-8 mb-6 overflow-hidden rounded-2xl border border-[var(--tikkitte-cream-border)] bg-[var(--tikkitte-cream)] px-5 py-2 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-[var(--tikkitte-cream-border)] py-3">
                <dt className="text-[var(--tikkitte-ink-soft)]">Unsettled ticket sales</dt>
                <dd className="font-semibold tabular-nums">{formatMoneyFromCents(breakdown.outstanding_gross_cents)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[var(--tikkitte-cream-border)] py-3">
                <dt className="text-[var(--tikkitte-ink-soft)]">Platform fee ({breakdown.fee_percent}%)</dt>
                <dd className="font-semibold tabular-nums">−{formatMoneyFromCents(breakdown.fee_cents)}</dd>
              </div>
              {breakdown.unconsumed_adjustments_cents !== 0 && (
                <div className="flex items-center justify-between gap-4 border-b border-[var(--tikkitte-cream-border)] py-3">
                  <dt className="text-[var(--tikkitte-ink-soft)]">Settlement adjustments</dt>
                  <dd className="font-semibold tabular-nums">
                    {breakdown.unconsumed_adjustments_cents > 0 ? '+' : '−'}
                    {formatMoneyFromCents(Math.abs(breakdown.unconsumed_adjustments_cents))}
                  </dd>
                </div>
              )}
              <div className="flex items-end justify-between gap-4 py-4">
                <dt className="font-semibold">Payout amount</dt>
                <dd className="create-display text-[25px] tabular-nums">{formatMoneyFromCents(breakdown.net_cents)}</dd>
              </div>
            </dl>

            {!hasPayoutAccount ? (
              <div className="rounded-xl border border-dashed border-[var(--tikkitte-cream-border)] p-4 text-sm">
                <p className="font-semibold">Add a payout account first</p>
                <p className="mt-1 text-[var(--tikkitte-ink-soft)]">Choose where funds should be sent in Settings.</p>
              </div>
            ) : breakdown.net_cents < 1000 ? (
              <p className="rounded-xl bg-[var(--tikkitte-cream)] p-4 text-sm text-[var(--tikkitte-ink-soft)]">
                The amount currently owed is below the GHS 10 minimum payout.
              </p>
            ) : null}

            {serverError && <p className="mt-4 text-sm font-medium text-red-700" role="alert">{serverError}</p>}
          </>
        )}

        {!success && (
          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="create-focus min-h-12 rounded-full border border-[var(--tikkitte-cream-border)] px-6 text-sm font-semibold hover:border-[var(--tikkitte-ink)] disabled:opacity-50"
            >
              Cancel
            </button>
            {!hasPayoutAccount ? (
              <Link href="/dashboard/settings" className="create-focus inline-flex min-h-12 items-center justify-center rounded-full bg-[#191917] px-6 text-sm font-semibold text-white hover:bg-black">
                Go to Settings
              </Link>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="create-focus min-h-12 rounded-full bg-[#2e6fe6] px-6 text-sm font-semibold text-white hover:bg-[#2565d0] disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isPending ? 'Requesting…' : `Request ${formatMoneyFromCents(breakdown.net_cents)}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
