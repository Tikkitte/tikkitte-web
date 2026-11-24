'use client'
/* Profile images use existing stored URLs directly. */
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { sortOrganizers } from '@/lib/organizer-review'
import { useRouter } from 'next/navigation'
import { useId, useMemo, useState, useTransition } from 'react'
import { approveOrganizer, reviewOrganizer, resendOrganizerApproval, setOrganizerFee, setOrganizerServiceFee } from './actions'

export type OrganizerAdminRow = {
  id: string
  display_name: string
  email: string
  logo_url: string | null
  created_at: string
  approved: boolean
  review_status: 'pending' | 'needs_info' | 'declined' | 'approved'
  approved_at: string | null
  bio: string | null
  instagram_url: string | null
  application: Record<string, string | boolean | null> | null
  events: { id: string; name: string; date: string | null; published: boolean; tickets: { label: string; price: number }[] }[]
  slug: string | null
  platform_fee_percent: number | null
  service_fee_percent: number | null
}

type FeeEditorProps = {
  organizer: OrganizerAdminRow
  label: string
  feePercent: number | null
  defaultPercent: number | null
  saveAction: typeof setOrganizerFee
  helperText: string
}

function FeeEditor({ organizer, label, feePercent, defaultPercent, saveAction, helperText }: FeeEditorProps) {
  const router = useRouter()
  const inputId = useId()
  const initialValue = feePercent === null ? '' : String(feePercent)
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const isDirty = value.trim() !== initialValue

  const save = (nextFeePercent: number | null) => {
    setError(null)
    startTransition(async () => {
      const result = await saveAction(organizer.id, nextFeePercent)
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.refresh()
    })
  }

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    if (!isDirty) return
    const trimmed = value.trim()
    if (trimmed === '') { save(null); return }
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed)) {
      setError('Enter a valid number.')
      return
    }
    save(parsed)
  }

  return (
    <form method="post" onSubmit={handleSave} className="flex w-48 flex-col gap-1.5">
      <label htmlFor={inputId} className="text-xs font-semibold text-[var(--tikkitte-ink-soft)]">{label}</label>
      <div className="flex items-center gap-2">
        <div className="create-input flex h-9 w-24 items-center gap-1 rounded-full px-3 py-0">
          <input
            id={inputId}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={defaultPercent === null ? '' : String(defaultPercent)}
            inputMode="decimal"
            aria-label={`${label} percent for ${organizer.display_name}`}
            className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-[var(--tikkitte-ink-faint)]"
          />
          <span className="text-xs text-[var(--tikkitte-ink-faint)]">%</span>
        </div>
        <button
          type="submit"
          disabled={isPending || !isDirty}
          className="create-focus h-9 shrink-0 rounded-full border border-[var(--tikkitte-cream-border)] bg-white px-4 text-xs font-semibold transition-colors enabled:hover:bg-[var(--tikkitte-cream)] disabled:opacity-40"
        >
          {isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
      <p className="text-[11px] leading-snug text-[var(--tikkitte-ink-faint)]">{helperText}</p>
      {error && <p role="alert" className="text-[11px] leading-snug text-red-600">{error}</p>}
    </form>
  )
}

type Props = {
  organizers: OrganizerAdminRow[]
  platformFeePercentDefault: number | null
  serviceFeePercent: number | null
  now: number
}

type Tab = 'pending' | 'approved' | 'declined' | 'all'

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'T'
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function OrganizersClient({ organizers, platformFeePercentDefault, serviceFeePercent, now }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('pending')
  const [modal, setModal] = useState<{ organizer: OrganizerAdminRow; kind: 'approved' | 'needs_info' | 'declined' } | null>(null)
  const [platform, setPlatform] = useState('')
  const [service, setService] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(false)
  const [requestId, setRequestId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const visible = useMemo(() => sortOrganizers(organizers, tab), [organizers, tab])
  function open(organizer: OrganizerAdminRow, kind: 'approved' | 'needs_info' | 'declined') {
    setModal({ organizer, kind }); setPlatform(organizer.platform_fee_percent == null ? '' : String(organizer.platform_fee_percent)); setService(organizer.service_fee_percent == null ? '' : String(organizer.service_fee_percent)); setMessage(''); setError(''); setRetry(false); setRequestId(null)
  }
  function confirm(event: React.FormEvent) {
    event.preventDefault()
    if (!modal) return
    setError('')
    const actionId = requestId ?? crypto.randomUUID()
    setRequestId(actionId)
    startTransition(async () => {
      const result = modal.kind === 'approved'
        ? retry ? await resendOrganizerApproval(modal.organizer.id) : await approveOrganizer(modal.organizer.id, platform.trim() === '' ? null : Number(platform), service.trim() === '' ? null : Number(service))
        : await reviewOrganizer(modal.organizer.id, modal.kind, message, actionId, retry)
      if (!result.ok) { setError(result.message); return }
      router.refresh()
      if (!result.emailSent) { setRetry(true); setError('Account status saved, but the email was not sent. Try sending it again.'); return }
      setModal(null)
    })
  }
  return <div className="space-y-5">
    <div className="flex flex-wrap gap-2">{(['pending','approved','declined','all'] as Tab[]).map(item => <button key={item} type="button" onClick={() => setTab(item)} aria-pressed={tab === item} className={`rounded-full px-5 py-3 text-sm font-semibold capitalize ${tab === item ? 'bg-[#191917] text-white' : 'bg-white'}`}>{item} ({organizers.filter(row => item === 'all' || (item === 'pending' ? ['pending','needs_info'].includes(row.review_status) : row.review_status === item)).length})</button>)}</div>
    {visible.length === 0 && <p className="create-card p-8 text-sm text-gray-500">No organizers in this view.</p>}
    {visible.map(organizer => {
      const application = organizer.application
      const waitingDays = Math.max(0, Math.floor((now - Date.parse(String(application?.submitted_at ?? organizer.created_at))) / 86400000))
      return <section key={organizer.id} className="create-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-bold">{initialsFor(organizer.display_name)}</span><div><h2 className="font-semibold">{organizer.display_name} <span className="ml-2 text-xs font-normal text-gray-500">{organizer.review_status === 'needs_info' ? 'Needs info' : organizer.review_status}</span></h2><p className="text-sm text-gray-500">{organizer.email}</p><p className="mt-1 text-xs text-gray-500">Joined {formatDate(organizer.created_at)}{!organizer.approved && organizer.review_status !== 'declined' ? ` · Waiting ${waitingDays} days` : ''}</p></div></div>
        {!organizer.approved && <div className="flex flex-wrap gap-2"><button className="rounded-full bg-[#2e6fe6] px-4 py-2 text-sm font-semibold text-white" onClick={() => open(organizer,'approved')}>Approve</button><button disabled={!application} className="rounded-full border px-4 py-2 text-sm disabled:opacity-40" onClick={() => open(organizer,'needs_info')}>Needs info</button><button className="rounded-full border px-4 py-2 text-sm text-red-600" onClick={() => open(organizer,'declined')}>Decline</button></div>}</div>
        {organizer.approved && <div className="mt-5 flex flex-wrap gap-6"><FeeEditor organizer={organizer} label="Platform fee" feePercent={organizer.platform_fee_percent} defaultPercent={platformFeePercentDefault} saveAction={setOrganizerFee} helperText="Applies to new events." /><FeeEditor organizer={organizer} label="Service fee" feePercent={organizer.service_fee_percent} defaultPercent={serviceFeePercent} saveAction={setOrganizerServiceFee} helperText="Applies to new checkouts." /></div>}
        {!organizer.approved && <details className="mt-4"><summary className="cursor-pointer text-sm font-semibold">Application, profile and drafts</summary><div className="mt-4 space-y-4 text-sm">
          {organizer.logo_url && <img src={organizer.logo_url} alt="Organizer profile" className="h-20 w-20 rounded-full object-cover" />}
          <p>{organizer.bio || 'No bio yet.'}</p>
          {organizer.slug && <Link href={`/o/${organizer.slug}`} target="_blank" rel="noreferrer" className="mr-4 underline">Public profile</Link>}
          {organizer.instagram_url && <a href={organizer.instagram_url} target="_blank" rel="noopener noreferrer" className="underline">Instagram</a>}
          {application ? <><div className="flex gap-4"><a className="underline" href={`tel:${application.phone}`}>Call {application.phone}</a><a className="underline" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${String(application.phone).replace(/\D/g,'')}`}>WhatsApp</a></div><dl className="grid gap-2 sm:grid-cols-2">{Object.entries(application).filter(([key]) => ['organizer_type','preferred_contact','heard_from'].includes(key)).map(([key,value]) => <div key={key}><dt className="text-xs capitalize text-gray-500">{key.replaceAll('_',' ')}</dt><dd>{typeof value === 'boolean' ? value ? 'Yes' : 'No' : value || '—'}</dd></div>)}</dl></> : <p>No application submitted yet.</p>}
          <ul className="space-y-2">{organizer.events.map(event => <li key={event.id} className="rounded-lg bg-gray-50 p-3"><p className="font-semibold">{event.name} · {event.date ?? 'Date TBA'} · {event.published ? 'Published' : 'Draft'}</p><p className="mt-1 text-xs">{event.tickets.map(ticket => `${ticket.label}: GHS ${ticket.price}`).join(' · ') || 'No ticket types yet.'}</p></li>)}</ul>
        </div></details>}
      </section>
    })}
    {modal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form method="post" onSubmit={confirm} role="dialog" aria-modal="true" aria-labelledby="review-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h2 id="review-title" className="text-xl font-bold">{modal.kind === 'approved' ? 'Approve organizer' : modal.kind === 'needs_info' ? 'Request more information' : 'Decline organizer'}</h2><p className="mb-5 mt-1 text-sm text-gray-500">{modal.organizer.display_name}</p>
      {modal.kind === 'approved' ? <div className="space-y-4"><label className="block text-sm font-medium">Platform fee (%)<input disabled={retry} inputMode="decimal" value={platform} onChange={event => setPlatform(event.target.value)} placeholder={String(platformFeePercentDefault ?? 'Platform default')} className="create-input mt-1" /></label><label className="block text-sm font-medium">Service fee (%)<input disabled={retry} inputMode="decimal" value={service} onChange={event => setService(event.target.value)} placeholder={String(serviceFeePercent ?? 'Platform default')} className="create-input mt-1" /></label><p className="text-xs text-gray-500">Blank means the platform default. Drafts they made during review switch to this platform fee. Manually negotiated event rates stay in place.</p></div> : <label className="block text-sm">{modal.kind === 'needs_info' ? 'Your question' : 'Reason (optional)'}<textarea disabled={retry} required={modal.kind === 'needs_info'} maxLength={2000} value={message} onChange={event => setMessage(event.target.value)} className="create-input mt-2 min-h-32" /><span className="mt-1 block text-xs text-gray-500">Sent in the email; not stored in the application.</span></label>}
      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" disabled={isPending} onClick={() => setModal(null)} className="rounded-full border px-4 py-2 text-sm">{retry ? 'Close' : 'Cancel'}</button><button disabled={isPending} className="rounded-full bg-[#191917] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{isPending ? 'Working…' : retry ? 'Send email again' : 'Confirm'}</button></div>
    </form></div>}
  </div>
}
