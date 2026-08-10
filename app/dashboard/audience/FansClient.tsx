'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

export type AudienceRow = {
  user_id: string
  email: string | null
  name: string | null
  event_count: number
  ticket_count: number
  last_event: string | null
  last_purchase_at: string
  total_spend: number
}

export type AudienceResponse = {
  rows: AudienceRow[]
  total_count: number
  repeat_count: number
  new_this_month_count: number
  filtered_count: number
  page: number
  page_size: number
}

type FanFilter = 'all' | 'repeat' | 'recent'
const PAGE_SIZE = 25

function initials(value: string | null) {
  return (value ?? 'Guest').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'G'
}

const audienceLoadError = 'Could not load your audience. Try again.'

export default function FansClient({
  initialAudience,
  initialLoadFailed = false,
}: {
  initialAudience: AudienceResponse
  initialLoadFailed?: boolean
}) {
  const [audience, setAudience] = useState(initialAudience)
  const [filter, setFilter] = useState<FanFilter>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [retryKey, setRetryKey] = useState(0)
  const [error, setError] = useState<string | null>(initialLoadFailed ? audienceLoadError : null)
  const [isPending, startTransition] = useTransition()
  const initialLoad = useRef(true)

  useEffect(() => {
    if (initialLoad.current) {
      initialLoad.current = false
      if (!initialLoadFailed) return
    }
    let cancelled = false
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        const supabase = createClient()
        const { data, error: rpcError } = await supabase.rpc('get_organizer_audience', {
          p_page: page,
          p_page_size: PAGE_SIZE,
          p_filter: filter,
          p_search: search.trim(),
        })
        if (cancelled) return
        if (rpcError || !data) {
          setError(audienceLoadError)
          return
        }
        setError(null)
        setAudience(data as AudienceResponse)
      })
    }, search ? 250 : 0)
    return () => { cancelled = true; window.clearTimeout(timer) }
  }, [page, filter, search, retryKey, initialLoadFailed])

  const selectFilter = (nextFilter: FanFilter) => { setFilter(nextFilter); setPage(1) }
  const totalPages = Math.max(1, Math.ceil(audience.filtered_count / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Audience totals">
        {[['Total contacts', audience.total_count], ['Repeat attendees', audience.repeat_count], ['New this month', audience.new_this_month_count]].map(([label, value]) => <div key={label} className="create-card p-5"><p className="text-sm text-[var(--tikkitte-ink-faint)]">{label}</p><p className="create-display mt-1 text-[30px]">{Number(value).toLocaleString()}</p>{label === 'Repeat attendees' && <p className="text-xs text-[var(--tikkitte-ink-faint)]">Attended 2+ events</p>}</div>)}
      </section>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="create-input flex min-h-11 flex-1 items-center gap-3 rounded-full lg:max-w-[420px]">
          <span className="sr-only">Search audience</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-[var(--tikkitte-ink-faint)]">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1) }}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--tikkitte-ink-faint)]"
            placeholder="Search name or email…"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto" aria-label="Audience filter">
          {([['all', 'All contacts'], ['repeat', 'Repeat attendees'], ['recent', 'Recent buyers']] as const).map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => selectFilter(value)} className={`create-focus min-h-11 whitespace-nowrap rounded-full border px-5 text-sm font-semibold ${filter === value ? 'border-[#191917] bg-[#191917] text-white' : 'border-[var(--tikkitte-cream-border)] bg-white text-[var(--tikkitte-ink-soft)]'}`}>{label}</button>)}
        </div>
      </div>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setRetryKey((value) => value + 1)}
            className="create-focus min-h-10 self-start rounded-full border border-red-200 bg-white px-4 font-semibold text-red-700 disabled:opacity-50 sm:self-auto"
          >
            {isPending ? 'Retrying…' : 'Retry'}
          </button>
        </div>
      )}

      <section className={`create-card overflow-hidden transition-opacity ${isPending ? 'opacity-60' : ''}`} aria-busy={isPending}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead><tr className="border-b border-[var(--tikkitte-cream-border)] text-[10.5px] uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]"><th className="px-5 py-4 text-left">Name</th><th className="px-5 py-4 text-left">Email</th><th className="px-4 py-4 text-right">Events</th><th className="px-5 py-4 text-left">Last event</th><th className="px-5 py-4 text-right">Total spend</th></tr></thead>
            <tbody>
              {audience.rows.length === 0 ? <tr><td colSpan={5} className="px-5 py-16 text-center text-[var(--tikkitte-ink-faint)]">{search ? 'No contacts match your search.' : 'Ticket buyers will appear here.'}</td></tr> : audience.rows.map((fan, index) => <tr key={fan.user_id} className={`border-b border-[var(--tikkitte-cream-border)] last:border-0 hover:bg-[var(--tikkitte-cream)] ${index % 2 ? 'bg-[#faf9f5]' : ''}`}><td className="px-5 py-4"><div className="flex items-center gap-3"><span className={`create-display flex h-8 w-8 items-center justify-center rounded-full text-xs text-white ${index % 3 === 1 ? 'bg-[#191917]' : index % 3 === 2 ? 'bg-[#3d3c4a]' : 'bg-[#2e6fe6]'}`}>{initials(fan.name)}</span><span className="font-semibold">{fan.name ?? 'Guest'}</span></div></td><td className="px-5 py-4 text-[var(--tikkitte-ink-soft)]">{fan.email ?? '—'}</td><td className="px-4 py-4 text-right">{fan.event_count}</td><td className="px-5 py-4 text-[var(--tikkitte-ink-soft)]">{fan.last_event ?? '—'}</td><td className="px-5 py-4 text-right font-semibold">GHS {Number(fan.total_spend).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>)}
            </tbody>
          </table>
        </div>
        <footer className="flex flex-col gap-3 border-t border-[var(--tikkitte-cream-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-[var(--tikkitte-ink-faint)]">Showing {audience.filtered_count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, audience.filtered_count)} of {audience.filtered_count.toLocaleString()}</p><div className="flex gap-2"><button type="button" disabled={page <= 1 || isPending} onClick={() => setPage((value) => Math.max(1, value - 1))} className="create-focus min-h-10 rounded-full border border-[var(--tikkitte-cream-border)] px-5 text-sm font-semibold disabled:opacity-40">← Previous</button><button type="button" disabled={page >= totalPages || isPending} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="create-focus min-h-10 rounded-full border border-[var(--tikkitte-cream-border)] px-5 text-sm font-semibold disabled:opacity-40">Next →</button></div></footer>
      </section>
    </div>
  )
}
