'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createOrganizerSubaccount, getSubaccountBanks, resolveSubaccount, type SubaccountPreview } from './actions'

export default function SubaccountEditor({ organizerId, code, creationPending }: {
  organizerId: string; code: string | null; creationPending: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [banks, setBanks] = useState<Array<{ code: string; name: string }>>([])
  const [bankCode, setBankCode] = useState('')
  const [preview, setPreview] = useState<SubaccountPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const buttonClass = 'create-focus min-h-9 rounded-full border border-[var(--tikkitte-cream-border)] bg-white px-4 text-xs font-semibold disabled:opacity-60'

  if (code) return <p className="mt-3 text-xs text-[var(--tikkitte-ink-soft)]">Paystack subaccount: {code}. Enable split payments separately for each event.</p>
  if (creationPending) return <p role="status" className="mt-3 text-xs text-amber-800">Subaccount creation is pending or needs reconciliation. Check Paystack before retrying.</p>

  return (
    <div className="mt-3 space-y-3">
      <button type="button" disabled={pending} className={buttonClass} aria-expanded={open} onClick={() => {
        if (open) { setOpen(false); return }
        setOpen(true)
        setError(null)
        startTransition(async () => {
          const result = await getSubaccountBanks()
          if (result.ok) setBanks(result.banks)
          else setError(result.message)
        })
      }}>{open ? 'Close subaccount setup' : 'Create Paystack subaccount'}</button>
      {open && <div className="max-w-xl space-y-3 rounded-xl border border-[var(--tikkitte-cream-border)] p-4 text-sm">
        <p>Uses the organizer’s primary bank payout account. Select the matching bank and review the verified account name.</p>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold">Ghanaian bank</span>
          <select className="create-input w-full p-2" value={bankCode} disabled={pending} onChange={(e) => { setBankCode(e.target.value); setPreview(null); setError(null) }}>
            <option value="">Select a bank</option>
            {banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
          </select>
        </label>
        <button type="button" className={buttonClass} disabled={pending || !bankCode} onClick={() => {
          setError(null)
          setPreview(null)
          startTransition(async () => {
            const result = await resolveSubaccount(organizerId, bankCode)
            if (result.ok) setPreview(result.preview)
            else setError(result.message)
          })
        }}>{pending ? 'Working…' : 'Verify account'}</button>
        {preview && <div className="space-y-2">
          <p>Verified name: <strong>{preview.account_name}</strong> · account ending {preview.account_last4}</p>
          <p className="text-xs text-[var(--tikkitte-ink-soft)]">Organizer entered: {preview.entered_account_name} · {preview.entered_provider}</p>
          <button type="button" className={buttonClass} disabled={pending} onClick={() => {
            setError(null)
            startTransition(async () => {
              const result = await createOrganizerSubaccount(organizerId, bankCode, preview.account_id, preview.account_name)
              if (!result.ok) setError(result.message)
              router.refresh()
            })
          }}>{pending ? 'Creating…' : 'Confirm account and create subaccount'}</button>
        </div>}
        <p className="text-xs text-[var(--tikkitte-ink-soft)]">Creating a subaccount leaves split payments off for every event.</p>
      </div>}
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  )
}
