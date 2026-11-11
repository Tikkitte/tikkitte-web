'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition, type MouseEvent } from 'react'
import { requestPayout } from '@/app/dashboard/payout-actions'
import ProviderLogo from '@/app/dashboard/settings/ProviderLogo'
import type { EventOutstandingPayout, PayoutAccount } from '@/lib/types'

export type PayoutDestination = Pick<PayoutAccount, 'method' | 'provider' | 'account_number'>

type Props = {
  eventId: string
  eventName: string
  eventDate: string | null
  breakdown: EventOutstandingPayout
  payoutAccount: PayoutDestination | null
  onClose: () => void
}

const MINIMUM_CENTS = 1000
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// The input always uses en-US grouping so parsing never depends on the viewer's locale.
function formatAmount(cents: number) {
  return (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatMoney(cents: number) {
  return `GHS ${formatAmount(cents)}`
}

// Accepts "3000", "3,000.50", "GHS 3000" or "₵3000". Returns null when empty and
// NaN when the text is not an amount in GHS with at most two decimals.
function parseAmountCents(value: string): number | null {
  const normalized = value.trim().replace(/^(GHS|GH₵|₵)\s*/i, '').replace(/[\s,]/g, '')
  if (!normalized) return null
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return NaN
  return Math.round(Number(normalized) * 100)
}

function formatEventDate(date: string | null) {
  if (!date) return null
  const [, month, day] = date.split('-').map(Number)
  return month && day ? `${MONTHS[month - 1]} ${day}` : null
}

function providerName(account: PayoutDestination) {
  return account.method === 'mobile_money' && account.provider.trim().toUpperCase() === 'MTN' ? 'MTN MoMo' : account.provider
}

export default function RequestPayoutModal({ eventId, eventName, eventDate, breakdown, payoutAccount, onClose }: Props) {
  const router = useRouter()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const fullCents = breakdown.net_cents
  const [amount, setAmount] = useState(formatAmount(fullCents))
  const amountCents = parseAmountCents(amount)
  const isNumber = typeof amountCents === 'number' && !Number.isNaN(amountCents)
  const validAmount = isNumber && amountCents >= MINIMUM_CENTS && amountCents <= fullCents
  const leftoverCents = isNumber ? fullCents - amountCents : 0
  const canSubmit = validAmount && payoutAccount !== null && !isPending && !success

  // Paid and pending partial payouts get their own lines, so the adjustments
  // row shows only refund debt and other settlement adjustments.
  const partialPaidCents = breakdown.partial_paid_cents ?? 0
  const partialPendingCents = breakdown.partial_pending_cents ?? 0
  const otherAdjustmentsCents = breakdown.unconsumed_adjustments_cents + partialPaidCents

  let helper: { text: string; tone: 'neutral' | 'warning' | 'error' }
  if (amountCents === null) {
    helper = { text: 'Enter the amount you want to request.', tone: 'neutral' }
  } else if (!isNumber) {
    helper = { text: 'Enter an amount in GHS, like 3,000 or 3,000.50.', tone: 'error' }
  } else if (amountCents > fullCents) {
    helper = { text: 'That is more than the available balance.', tone: 'error' }
  } else if (amountCents < MINIMUM_CENTS) {
    helper = { text: 'Payouts must be at least GHS 10.00.', tone: 'error' }
  } else if (leftoverCents > 0 && leftoverCents < MINIMUM_CENTS) {
    helper = { text: `You will have ${formatMoney(leftoverCents)} remaining, below the GHS 10 minimum.`, tone: 'warning' }
  } else {
    helper = { text: `You will have ${formatMoney(leftoverCents)} remaining.`, tone: 'neutral' }
  }

  const helperColor = helper.tone === 'error'
    ? 'text-[#b3372a]'
    : helper.tone === 'warning' ? 'text-[#765400]' : 'text-[var(--tikkitte-ink-soft)]'
  const fieldBorder = helper.tone === 'error'
    ? 'border-[#b3372a]'
    : 'border-[var(--tikkitte-cream-border)] focus-within:border-[var(--tikkitte-blue-bright)]'
  const dateLabel = formatEventDate(eventDate)

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
    if (!canSubmit || !isNumber) return

    setServerError(null)
    startTransition(async () => {
      try {
        const result = await requestPayout(eventId, amountCents)
        if (!result.ok) {
          setServerError(result.message)
          return
        }
        setSuccess(true)
      } catch {
        // A failed server action call would otherwise surface as a page error.
        setServerError('We couldn’t confirm your request. Check your connection, then refresh to see whether it went through.')
      }
    })
  }

  const closeOnBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isPending) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45" onMouseDown={closeOnBackdrop}>
      <div className="flex min-h-full items-center justify-center px-3 py-6 sm:px-4 sm:py-8" onMouseDown={closeOnBackdrop}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-payout-title"
          className="w-full max-w-[480px] rounded-[24px] border border-[var(--tikkitte-cream-border)] bg-[var(--tikkitte-white)] px-4 py-5 text-[var(--tikkitte-ink)] shadow-2xl sm:rounded-[28px] sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 id="request-payout-title" className="create-display text-[34px] sm:text-[40px]">Request payout</h2>
              <p className="mt-2 truncate text-[15px] text-[var(--tikkitte-ink-soft)]">
                {eventName}{dateLabel ? ` · ${dateLabel}` : ''}
              </p>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="create-focus -mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tikkitte-ink-soft)] hover:bg-[var(--tikkitte-cream)] hover:text-[var(--tikkitte-ink)] disabled:opacity-50"
              aria-label="Close payout request"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {success ? (
            <div className="py-12 text-center" role="status">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#e8f4ea] text-[#147a35]">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold">Payout requested</p>
              <p className="mt-1 text-sm text-[var(--tikkitte-ink-soft)]">We&apos;ll email you when the status changes.</p>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                submit()
              }}
            >
              <dl className="mt-6 rounded-2xl bg-[var(--tikkitte-cream)] text-sm sm:mt-7 sm:text-[15px] [&_dd]:whitespace-nowrap">
                <div className="space-y-3 px-5 pb-4 pt-5">
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <dt className="text-[var(--tikkitte-ink-soft)]">Unsettled ticket sales</dt>
                    <dd className="font-semibold tabular-nums">{formatMoney(breakdown.outstanding_gross_cents)}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <dt className="text-[var(--tikkitte-ink-soft)]">Platform fee ({breakdown.fee_percent}%)</dt>
                    <dd className="font-semibold tabular-nums">−{formatMoney(breakdown.fee_cents)}</dd>
                  </div>
                  {otherAdjustmentsCents !== 0 && (
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <dt className="text-[var(--tikkitte-ink-soft)]">Settlement adjustments</dt>
                      <dd className="font-semibold tabular-nums">
                        {otherAdjustmentsCents > 0 ? '+' : '−'}{formatMoney(Math.abs(otherAdjustmentsCents))}
                      </dd>
                    </div>
                  )}
                  {partialPaidCents !== 0 && (
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <dt className="text-[var(--tikkitte-ink-soft)]">Partial payouts paid</dt>
                      <dd className="font-semibold tabular-nums">−{formatMoney(partialPaidCents)}</dd>
                    </div>
                  )}
                  {partialPendingCents !== 0 && (
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <dt className="text-[var(--tikkitte-ink-soft)]">Pending partial payout</dt>
                      <dd className="font-semibold tabular-nums">−{formatMoney(partialPendingCents)}</dd>
                    </div>
                  )}
                </div>
                {/* Ticket-stub divider: a dashed rule with notches cut from both edges. */}
                <div className="relative mx-5 flex items-baseline justify-between gap-3 sm:gap-4 border-t-2 border-dashed border-[var(--tikkitte-cream-border)] pb-5 pt-4 before:absolute before:-left-[31px] before:top-[-1px] before:h-5 before:w-5 before:-translate-y-1/2 before:rounded-full before:bg-[var(--tikkitte-white)] before:content-[''] after:absolute after:-right-[31px] after:top-[-1px] after:h-5 after:w-5 after:-translate-y-1/2 after:rounded-full after:bg-[var(--tikkitte-white)] after:content-['']">
                  <dt className="font-semibold">Available<span className="hidden min-[375px]:inline"> to request</span></dt>
                  <dd className="text-lg font-semibold tabular-nums sm:text-[22px]">{formatMoney(fullCents)}</dd>
                </div>
              </dl>

              <div className="mt-7 flex items-baseline justify-between gap-4">
                <label htmlFor="payout-amount" className="text-[15px] font-semibold">Payout amount</label>
                {amountCents !== fullCents && (
                  <button
                    type="button"
                    onClick={() => setAmount(formatAmount(fullCents))}
                    disabled={isPending}
                    className="create-focus text-sm font-semibold text-[var(--tikkitte-blue)] underline underline-offset-4 hover:text-[var(--tikkitte-blue-hover)] disabled:opacity-50"
                  >
                    Use full amount
                  </button>
                )}
              </div>

              <div className={`mt-3 flex h-16 items-center gap-3 rounded-2xl border bg-[var(--tikkitte-white)] px-5 transition-shadow focus-within:shadow-[0_0_0_3px_var(--tikkitte-blue-tint-soft)] ${fieldBorder}`}>
                <span className="text-[15px] font-semibold text-[var(--tikkitte-ink-faint)]" aria-hidden="true">GHS</span>
                <input
                  id="payout-amount"
                  inputMode="decimal"
                  autoComplete="off"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  onBlur={() => { if (isNumber) setAmount(formatAmount(amountCents)) }}
                  disabled={isPending}
                  aria-invalid={helper.tone === 'error'}
                  aria-describedby="payout-amount-help"
                  placeholder="0.00"
                  className="min-w-0 flex-1 bg-transparent text-right text-[26px] font-semibold tabular-nums text-[var(--tikkitte-ink)] outline-none placeholder:text-[var(--tikkitte-ink-faint)]"
                />
              </div>
              <p id="payout-amount-help" className={`mt-2.5 min-h-5 text-sm ${helperColor}`} aria-live="polite">
                {helper.text}
              </p>

              {payoutAccount ? (
                <div className="mt-5 flex w-full items-center gap-3 rounded-full border border-[var(--tikkitte-cream-border)] bg-[var(--tikkitte-cream)] py-2 pl-2 pr-5 text-sm sm:text-[15px]">
                  <ProviderLogo provider={payoutAccount.provider} size="sm" />
                  {/* A long bank name truncates; the last four digits always show. */}
                  <p className="flex min-w-0 flex-1 items-baseline gap-1.5 text-[var(--tikkitte-ink-soft)]">
                    <span className="shrink-0">Paid to</span>
                    <span className="truncate font-semibold text-[var(--tikkitte-ink)]">{providerName(payoutAccount)}</span>
                    <span className="shrink-0 font-semibold tabular-nums text-[var(--tikkitte-ink)]">•••• {payoutAccount.account_number.slice(-4)}</span>
                  </p>
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-[var(--tikkitte-cream-border)] p-4 text-[15px]">
                  <p className="font-semibold">Add a payout account first</p>
                  <p className="mt-1 text-[var(--tikkitte-ink-soft)]">Choose where funds should be sent in Settings.</p>
                </div>
              )}

              {serverError && <p className="mt-4 text-sm font-medium text-[#b3372a]" role="alert">{serverError}</p>}

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isPending}
                  className="create-focus min-h-12 rounded-full border border-[var(--tikkitte-cream-border)] px-7 text-[15px] font-semibold hover:border-[var(--tikkitte-ink)] disabled:opacity-50"
                >
                  Cancel
                </button>
                {payoutAccount ? (
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="create-focus min-h-12 rounded-full bg-[var(--tikkitte-blue-bright)] px-7 text-[15px] font-semibold text-white hover:bg-[var(--tikkitte-blue)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[var(--tikkitte-blue-bright)]"
                  >
                    {isPending ? 'Requesting…' : validAmount ? `Request ${formatMoney(amountCents)}` : 'Request payout'}
                  </button>
                ) : (
                  <Link href="/dashboard/settings" className="create-focus inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--tikkitte-ink)] px-7 text-[15px] font-semibold text-[var(--tikkitte-white)] hover:opacity-90">
                    Go to Settings
                  </Link>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
