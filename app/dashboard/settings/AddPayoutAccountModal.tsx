'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { addPayoutAccount } from './payout-actions'
import { BANK_PROVIDERS, MOBILE_MONEY_PROVIDERS, type PayoutMethod } from './payout-options'
import { inputClass } from '@/components/dashboard/inputStyles'

type Props = {
  hasAccounts: boolean
  onClose: () => void
}

export default function AddPayoutAccountModal({ hasAccounts, onClose }: Props) {
  const router = useRouter()
  const [method, setMethod] = useState<PayoutMethod>('mobile_money')
  const [provider, setProvider] = useState<string>(MOBILE_MONEY_PROVIDERS[0])
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [branch, setBranch] = useState('')
  const [isPrimary, setIsPrimary] = useState(!hasAccounts)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const providers = method === 'mobile_money' ? MOBILE_MONEY_PROVIDERS : BANK_PROVIDERS

  const changeMethod = (nextMethod: PayoutMethod) => {
    setMethod(nextMethod)
    setProvider(nextMethod === 'mobile_money' ? MOBILE_MONEY_PROVIDERS[0] : BANK_PROVIDERS[0])
    if (nextMethod === 'mobile_money') setBranch('')
  }

  const save = () => {
    setError(null)
    startTransition(async () => {
      const result = await addPayoutAccount({
        method,
        provider,
        accountNumber,
        accountName,
        branch: method === 'bank_transfer' ? branch : '',
        isPrimary: hasAccounts ? isPrimary : true,
      })

      if (!result.ok) {
        setError(result.message)
        return
      }

      router.refresh()
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="dialog" aria-modal="true" aria-labelledby="add-payout-title">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="add-payout-title" className="create-display text-2xl">Add payout account</h2>
            <p className="mt-1 text-sm text-gray-500">Add where Tikkitte should send your payouts.</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="payout-method" className="mb-1.5 block text-sm font-medium text-gray-700">Payment method</label>
            <select
              id="payout-method"
              value={method}
              onChange={(event) => changeMethod(event.target.value as PayoutMethod)}
              className={inputClass}
            >
              <option value="mobile_money">Mobile Money (Preferred)</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label htmlFor="payout-provider" className="mb-1.5 block text-sm font-medium text-gray-700">Provider</label>
            <select
              id="payout-provider"
              value={provider}
              onChange={(event) => setProvider(event.target.value)}
              className={inputClass}
            >
              {providers.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="account-number" className="mb-1.5 block text-sm font-medium text-gray-700">Account number</label>
            <input
              id="account-number"
              value={accountNumber}
              onChange={(event) => setAccountNumber(event.target.value)}
              className={inputClass}
              placeholder="0244123456"
            />
          </div>

          <div>
            <label htmlFor="account-name" className="mb-1.5 block text-sm font-medium text-gray-700">Account name</label>
            <input
              id="account-name"
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              className={inputClass}
              placeholder="Account holder name"
            />
          </div>

          {method === 'bank_transfer' && (
            <div>
              <label htmlFor="account-branch" className="mb-1.5 block text-sm font-medium text-gray-700">Branch <span className="font-normal text-gray-400">(optional)</span></label>
              <input
                id="account-branch"
                value={branch}
                onChange={(event) => setBranch(event.target.value)}
                className={inputClass}
                placeholder="e.g. Obuasi"
              />
            </div>
          )}

          {hasAccounts && (
            <label className="flex items-start gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isPrimary}
                onChange={(event) => setIsPrimary(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-[#3d3d3d] focus:ring-[#3d3d3d]"
              />
              <span>
                <span className="block font-medium text-gray-700">Set as primary account</span>
                <span className="text-xs text-gray-400">Used for automatic payouts.</span>
              </span>
            </label>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="create-focus min-h-11 rounded-full border border-[var(--tikkitte-cream-border)] px-5 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="create-focus min-h-11 rounded-full bg-[#2e6fe6] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2565d0] disabled:opacity-60"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
