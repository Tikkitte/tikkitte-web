'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { requestPayout } from '@/app/dashboard/payout-actions'
import { inputClass } from './inputStyles'

type Props = {
  availableBalance: number
  hasPayoutAccount: boolean
  onClose: () => void
}

const quickAmounts = [100, 500, 1000]

function formatMoney(value: number, decimals = 2) {
  return `GHS ${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

function amountInputValue(value: number) {
  return value.toFixed(2)
}

function hasMoreThanTwoDecimals(value: string) {
  const [, decimals = ''] = value.trim().split('.')
  return decimals.length > 2
}

export default function RequestPayoutModal({ availableBalance, hasPayoutAccount, onClose }: Props) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const parsedAmount = Number(amount)
  const validationMessage = useMemo(() => {
    if (availableBalance < 10) return 'Your available balance is below the GHS 10 minimum.'
    const trimmed = amount.trim()
    if (!trimmed) return 'Enter an amount.'
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return 'Enter a valid payout amount.'
    if (hasMoreThanTwoDecimals(trimmed)) return 'Amount can only have up to 2 decimal places.'
    if (parsedAmount < 10) return 'Minimum payout is GHS 10'
    if (parsedAmount > availableBalance) return 'Insufficient balance'
    return null
  }, [amount, parsedAmount, availableBalance])

  const showValidationMessage = Boolean(validationMessage) && (amount.trim().length > 0 || availableBalance < 10)
  const canSubmit = hasPayoutAccount && !validationMessage && availableBalance >= 10 && !isPending && !success

  useEffect(() => {
    if (!success) return

    const timer = window.setTimeout(() => {
      router.refresh()
      onClose()
    }, 2000)

    return () => window.clearTimeout(timer)
  }, [onClose, router, success])

  const submit = () => {
    if (!canSubmit) return

    setServerError(null)
    startTransition(async () => {
      const result = await requestPayout(parsedAmount)

      if (!result.ok) {
        setServerError(result.message)
        return
      }

      setSuccess(true)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-payout-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="request-payout-title" className="text-lg font-bold text-gray-900">Request payout</h2>
            <p className="mt-1 text-sm text-gray-500">Payouts are processed after approval.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-t border-gray-100 pt-5">
          {!hasPayoutAccount ? (
            <div className="rounded-xl border border-dashed border-gray-200 px-5 py-8 text-center">
              <p className="text-sm font-medium text-gray-700">Add a payout account in Settings before requesting a payout.</p>
            </div>
          ) : success ? (
            <div className="px-4 py-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              </div>
              <p className="font-semibold text-gray-900">Payout requested</p>
              <p className="mt-1 text-sm text-gray-500">You&apos;ll get an email confirmation shortly.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <p className="text-sm text-gray-500">Available balance</p>
                <p className="text-lg font-bold text-gray-900">{formatMoney(availableBalance, 2)}</p>
              </div>

              <div>
                <label htmlFor="payout-amount" className="mb-1.5 block text-sm font-medium text-gray-700">Amount</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                    GHS
                  </span>
                  <input
                    id="payout-amount"
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value)
                      setServerError(null)
                    }}
                    className={`${inputClass} pl-14 ${showValidationMessage ? 'border-red-300 focus:ring-red-100' : ''}`}
                    placeholder="0.00"
                  />
                </div>
                {showValidationMessage && (
                  <p className="mt-1.5 text-sm text-red-500">{validationMessage}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((value) => {
                  const disabled = value > availableBalance
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setAmount(String(value))}
                      disabled={disabled}
                      className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
                    >
                      GHS {value}
                    </button>
                  )
                })}
                <button
                  type="button"
                  onClick={() => setAmount(amountInputValue(availableBalance))}
                  disabled={availableBalance < 10}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:border-gray-100 disabled:bg-gray-50 disabled:text-gray-300"
                >
                  Withdraw all
                </button>
              </div>

              {serverError && <p className="text-sm text-red-500">{serverError}</p>}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          {!hasPayoutAccount ? (
            <Link
              href="/dashboard/settings"
              className="rounded-lg bg-[#3d3d3d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
            >
              Go to Settings
            </Link>
          ) : !success ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!canSubmit}
                className="rounded-lg bg-[#3d3d3d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? 'Requesting...' : 'Continue'}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
