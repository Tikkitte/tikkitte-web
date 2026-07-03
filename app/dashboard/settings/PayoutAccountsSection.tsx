'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { PayoutAccount } from '@/lib/types'
import AddPayoutAccountModal from './AddPayoutAccountModal'
import { deletePayoutAccount, setPrimaryPayoutAccount } from './payout-actions'

type Props = {
  accounts: PayoutAccount[]
}

function methodLabel(method: PayoutAccount['method']) {
  return method === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer'
}

export default function PayoutAccountsSection({ accounts }: Props) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const runAction = (accountId: string, action: 'primary' | 'delete') => {
    setError(null)
    setActiveId(accountId)
    startTransition(async () => {
      const result = action === 'primary'
        ? await setPrimaryPayoutAccount(accountId)
        : await deletePayoutAccount(accountId)

      if (!result.ok) {
        setError(result.message)
        setActiveId(null)
        return
      }

      router.refresh()
      setActiveId(null)
    })
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Payout accounts</h2>
          <p className="mt-1 text-xs text-gray-400">Manage where your event payouts should be sent.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-[#3d3d3d] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
        >
          + Add account
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {accounts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-5 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">No payout accounts yet</p>
          <p className="mt-1 text-sm text-gray-400">Add your first account to prepare for payouts.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {accounts.map((account) => (
            <div key={account.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-900">{account.provider}</p>
                    {account.is_primary && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        PRIMARY
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{methodLabel(account.method)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{account.account_number}</p>
                  <p className="mt-1 text-sm text-gray-400">{account.account_name}</p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {!account.is_primary && (
                    <button
                      type="button"
                      onClick={() => runAction(account.id, 'primary')}
                      disabled={isPending && activeId === account.id}
                      className="text-sm font-semibold text-[#3d3d3d] hover:text-[#2a2a2a] disabled:opacity-60"
                    >
                      Set as primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => runAction(account.id, 'delete')}
                    disabled={account.is_primary || (isPending && activeId === account.id)}
                    title={account.is_primary ? 'Cannot delete primary account' : undefined}
                    className="text-sm font-semibold text-red-500 hover:text-red-600 disabled:cursor-not-allowed disabled:text-gray-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <AddPayoutAccountModal
          hasAccounts={accounts.length > 0}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  )
}
