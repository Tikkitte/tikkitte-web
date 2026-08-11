'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import type { EventOutstandingPayout } from '@/lib/types'
import { previewEventFee, setEventFee } from './actions'

export type EventFeeAdminRow = {
  id: string
  name: string
  slug: string | null
  date: string | null
  organizer_id: string | null
  published: boolean
  cancelled: boolean
  fee_percent: number | null
  organizer?: {
    id: string
    display_name: string
    email: string
  }
}

type FeePreview = EventOutstandingPayout & {
  proposed_fee_percent: number
  proposed_fee_cents: number
  proposed_net_cents: number
}

function formatDate(value: string | null) {
  if (!value) return 'Date TBA'

  const [year, month, day] = value.split('-').map(Number)

  if (![year, month, day].every(Number.isFinite)) return 'Date TBA'

  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCents(value: number) {
  return `GHS ${(value / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function FeeEditor({ event }: { event: EventFeeAdminRow }) {
  const router = useRouter()
  const [value, setValue] = useState(event.fee_percent === null ? '' : String(event.fee_percent))
  const [reason, setReason] = useState('')
  const [preview, setPreview] = useState<FeePreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPreviewPending, startPreviewTransition] = useTransition()
  const [isSaving, startSaveTransition] = useTransition()
  const previewSequence = useRef(0)
  const parsedFee = Number(value)
  const isValidFee = value.trim() !== '' && Number.isFinite(parsedFee) && parsedFee >= 0 && parsedFee <= 100
  const isChanged = isValidFee && parsedFee !== event.fee_percent

  useEffect(() => {
    if (!isChanged) return

    const sequence = ++previewSequence.current
    const timer = window.setTimeout(() => {
      startPreviewTransition(async () => {
        const result = await previewEventFee(event.id, parsedFee)
        if (previewSequence.current !== sequence) return
        if (!result.ok) {
          setPreview(null)
          setError(result.message)
          return
        }
        setPreview(result.preview)
      })
    }, 350)

    return () => window.clearTimeout(timer)
  }, [event.id, isChanged, parsedFee])

  const save = () => {
    if (!isChanged) {
      setError('Enter a different fee between 0 and 100.')
      return
    }
    if (preview && preview.outstanding_gross_cents > 0 && !reason.trim()) {
      setError('Add a reason because this event has unsettled sales.')
      return
    }

    setError(null)
    startSaveTransition(async () => {
      const result = await setEventFee(event.id, parsedFee, reason)
      if (!result.ok) {
        setError(result.message)
        return
      }
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <div className="mt-4 rounded-2xl border border-[var(--tikkitte-cream-border)] bg-[var(--tikkitte-cream)] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block sm:w-44">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">New event fee</span>
          <span className="create-input flex min-h-11 items-center rounded-xl px-3">
            <input
              value={value}
              onChange={(changeEvent) => {
                setValue(changeEvent.target.value)
                setSaved(false)
                setError(null)
                setPreview(null)
              }}
              inputMode="decimal"
              aria-describedby={`fee-help-${event.id}`}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
            />
            <span className="text-sm text-[var(--tikkitte-ink-faint)]">%</span>
          </span>
        </label>
        <p id={`fee-help-${event.id}`} className="pb-1 text-xs leading-5 text-[var(--tikkitte-ink-soft)]">
          Current rate: <strong className="text-[var(--tikkitte-ink)]">{event.fee_percent ?? 'Not configured'}%</strong>
        </p>
      </div>

      {isPreviewPending && <p className="mt-3 text-xs text-[var(--tikkitte-ink-faint)]" role="status">Calculating settlement impact…</p>}

      {preview && isChanged && (
        <div className="mt-4 grid gap-3 rounded-xl bg-white p-4 text-sm sm:grid-cols-3" aria-live="polite">
          <div>
            <p className="text-[11px] text-[var(--tikkitte-ink-faint)]">Unsettled gross</p>
            <p className="mt-1 font-semibold tabular-nums">{formatCents(preview.outstanding_gross_cents)}</p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--tikkitte-ink-faint)]">Organizer gets now</p>
            <p className="mt-1 font-semibold tabular-nums">{formatCents(preview.net_cents)}</p>
          </div>
          <div>
            <p className="text-[11px] text-[var(--tikkitte-ink-faint)]">Organizer gets at {preview.proposed_fee_percent}%</p>
            <p className="mt-1 font-semibold tabular-nums">{formatCents(preview.proposed_net_cents)}</p>
          </div>
        </div>
      )}

      {preview && preview.outstanding_gross_cents > 0 && isChanged && (
        <label className="mt-4 block">
          <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">Reason for renegotiation</span>
          <textarea
            value={reason}
            onChange={(changeEvent) => setReason(changeEvent.target.value)}
            maxLength={500}
            rows={2}
            className="create-input w-full resize-y rounded-xl px-3 py-2.5 text-sm outline-none"
            placeholder="Required because this event has unsettled sales"
          />
        </label>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-[11px] font-medium leading-5 text-[#765400]">
          This reprices all unsettled revenue and future sales for this event. Completed payouts keep their original rate.
        </p>
        <button
          type="button"
          onClick={save}
          disabled={!isChanged || isPreviewPending || isSaving}
          className="create-focus min-h-11 shrink-0 rounded-full bg-[#191917] px-5 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-45"
        >
          {isSaving ? 'Saving…' : saved ? 'Saved' : 'Save event fee'}
        </button>
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-700" role="alert">{error}</p>}
    </div>
  )
}

export default function EventsClient({ rows }: { rows: EventFeeAdminRow[] }) {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)

  return (
    <section className="create-card overflow-hidden">
      <div className="border-b border-[var(--tikkitte-cream-border)] px-5 py-4">
        <p className="text-sm font-semibold">{rows.length.toLocaleString()} events</p>
        <p className="mt-1 text-xs text-[var(--tikkitte-ink-faint)]">Open an event to preview and record a negotiated fee change.</p>
      </div>
      {rows.length === 0 ? (
        <div className="px-5 py-12 text-center text-sm text-[var(--tikkitte-ink-faint)]">No events found.</div>
      ) : (
        <div className="divide-y divide-[var(--tikkitte-cream-border)]">
          {rows.map((event) => {
            const expanded = expandedEventId === event.id
            return (
              <article key={event.id} className="px-5 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{event.name}</h2>
                      <span className="rounded-full bg-[#d9e4fa] px-2.5 py-1 text-[10px] font-bold uppercase text-[#2565d0]">{event.fee_percent ?? '—'}% fee</span>
                      {event.cancelled && <span className="rounded-full bg-[#fde9e7] px-2.5 py-1 text-[10px] font-bold uppercase text-[#a8322d]">Cancelled</span>}
                    </div>
                    <p className="mt-1 text-sm text-[var(--tikkitte-ink-soft)]">{event.organizer?.display_name ?? 'Unknown organizer'} · {formatDate(event.date)}</p>
                    <p className="mt-0.5 truncate text-xs text-[var(--tikkitte-ink-faint)]">{event.organizer?.email ?? 'No organizer email'}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`/e/${event.slug ?? event.id}`} target="_blank" rel="noreferrer" className="create-focus inline-flex min-h-11 items-center rounded-full border border-[var(--tikkitte-cream-border)] px-4 text-xs font-semibold hover:bg-[var(--tikkitte-cream)]">Public page ↗</Link>
                    <button
                      type="button"
                      onClick={() => setExpandedEventId(expanded ? null : event.id)}
                      aria-expanded={expanded}
                      className="create-focus min-h-11 rounded-full bg-[#191917] px-5 text-xs font-semibold text-white hover:bg-black"
                    >
                      {expanded ? 'Close' : 'Adjust fee'}
                    </button>
                  </div>
                </div>
                {expanded && <FeeEditor event={event} />}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
