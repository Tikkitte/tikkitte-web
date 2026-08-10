'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import type { PayoutAccount } from '@/lib/types'
import AddPayoutAccountModal from './AddPayoutAccountModal'
import ProviderLogo from './ProviderLogo'
import { deletePayoutAccount, setPrimaryPayoutAccount } from './payout-actions'

function methodLabel(method: PayoutAccount['method']) {
  return method === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer'
}

function maskAccount(value: string) {
  return value.length <= 4 ? value : `${value.slice(0, 3)} ··· ${value.slice(-4)}`
}

export default function PayoutAccountsSection({ accounts }: { accounts: PayoutAccount[] }) {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const primary = accounts.find((account) => account.is_primary) ?? null
  const alternatives = accounts.filter((account) => !account.is_primary)

  const runAction = (accountId: string, action: 'primary' | 'delete') => {
    setError(null)
    setActiveId(accountId)
    startTransition(async () => {
      const result = action === 'primary' ? await setPrimaryPayoutAccount(accountId) : await deletePayoutAccount(accountId)
      if (!result.ok) { setError(result.message); setActiveId(null); return }
      router.refresh()
      setActiveId(null)
    })
  }

  return (
    <section className="create-card border-[1.5px] border-[#bcd2f7] p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div><h2 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#2565d0]">Payout account</h2><p className="mt-1 text-xs text-[var(--tikkitte-ink-faint)]">New destinations replace the primary account without rewriting payout history.</p></div>
        {primary && <span className="rounded-full bg-[#d9e4fa] px-3 py-1 text-[10px] font-bold uppercase text-[#2565d0]">Primary</span>}
      </div>

      {error && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {primary ? (
        <div className="space-y-4">
          <div><p className="mb-1.5 text-sm font-medium">Provider</p><div className="create-input flex items-center gap-3 bg-[#faf9f5]"><ProviderLogo provider={primary.provider} /><span>{primary.provider} · {methodLabel(primary.method)}</span></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><p className="mb-1.5 text-sm font-medium">Account number</p><div className="create-input bg-[#faf9f5]">{maskAccount(primary.account_number)}</div></div><div><p className="mb-1.5 text-sm font-medium">Account name</p><div className="create-input bg-[#faf9f5]">{primary.account_name}</div></div></div>
          <p className="text-xs text-[var(--tikkitte-ink-faint)]">Payouts arrive within 3–5 business days of request.</p>
        </div>
      ) : <div className="rounded-xl border border-dashed border-[var(--tikkitte-cream-border)] px-5 py-8 text-center"><p className="font-semibold">No payout account connected</p><p className="mt-1 text-sm text-[var(--tikkitte-ink-faint)]">Add a destination before requesting a payout.</p></div>}

      <div className="mt-6 flex justify-end"><button type="button" onClick={() => setModalOpen(true)} className="create-focus min-h-11 rounded-full bg-[#2e6fe6] px-6 text-sm font-semibold text-white hover:bg-[#2565d0]">{primary ? 'Change payout account' : 'Add payout account'}</button></div>

      {alternatives.length > 0 && <div className="mt-6 border-t border-[var(--tikkitte-cream-border)] pt-5"><h3 className="mb-3 text-xs font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-faint)]">Previous accounts</h3><div className="space-y-3">{alternatives.map((account) => <div key={account.id} className="flex flex-col gap-3 rounded-xl bg-[#faf9f5] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><ProviderLogo provider={account.provider} /><div><p className="text-sm font-semibold">{account.provider} · {maskAccount(account.account_number)}</p><p className="text-xs text-[var(--tikkitte-ink-faint)]">{account.account_name}</p></div></div><div className="flex gap-3"><button type="button" disabled={isPending && activeId === account.id} onClick={() => runAction(account.id, 'primary')} className="create-focus text-xs font-semibold text-[#2565d0] disabled:opacity-50">Make primary</button><button type="button" disabled={isPending && activeId === account.id} onClick={() => runAction(account.id, 'delete')} className="create-focus text-xs font-semibold text-[#b3372a] disabled:opacity-50">Delete</button></div></div>)}</div></div>}

      {modalOpen && <AddPayoutAccountModal hasAccounts={accounts.length > 0} onClose={() => setModalOpen(false)} />}
    </section>
  )
}
