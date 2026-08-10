'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { approveOrganizer } from './actions'

export type OrganizerAdminRow = {
  id: string
  display_name: string
  email: string
  logo_url: string | null
  created_at: string
  approved: boolean
  slug: string | null
}

type Props = {
  organizers: OrganizerAdminRow[]
}

type Tab = 'pending' | 'approved' | 'all'

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

export default function OrganizersClient({ organizers }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('pending')
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const counts = useMemo(() => {
    const approved = organizers.filter((organizer) => organizer.approved).length
    const pending = organizers.length - approved
    return { pending, approved, all: organizers.length }
  }, [organizers])

  const visibleOrganizers = useMemo(() => {
    if (tab === 'pending') return organizers.filter((organizer) => !organizer.approved)
    if (tab === 'approved') return organizers.filter((organizer) => organizer.approved)
    return organizers
  }, [organizers, tab])

  const runApprove = (organizerId: string) => {
    setError(null)
    setActiveId(organizerId)
    startTransition(async () => {
      const result = await approveOrganizer(organizerId)

      if (!result.ok) {
        setError(result.message)
        setActiveId(null)
        return
      }

      router.refresh()
      setActiveId(null)
    })
  }

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: 'pending', label: 'Pending approval', count: counts.pending },
    { id: 'approved', label: 'Approved', count: counts.approved },
    { id: 'all', label: 'All', count: counts.all },
  ]

  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3" aria-label="Organizer totals">
        {[
          ['Pending approval', counts.pending],
          ['Approved', counts.approved],
          ['All organizers', counts.all],
        ].map(([label, value]) => (
          <div key={label} className="create-card p-5">
            <p className="text-[13px] text-[var(--tikkitte-ink-faint)]">{label}</p>
            <p className="create-display mt-1 text-[30px]">{Number(value).toLocaleString()}</p>
          </div>
        ))}
      </section>

      <section className="create-card overflow-hidden">
      <div className="border-b border-[var(--tikkitte-cream-border)] p-4">
        <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-[var(--tikkitte-cream)] p-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              className={`create-focus min-h-10 whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors ${
                tab === item.id ? 'bg-[#191917] text-white' : 'text-[var(--tikkitte-ink-soft)] hover:bg-white'
              }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>
      </div>

      {error && <p role="alert" className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {visibleOrganizers.length === 0 ? (
        <div className="m-5 rounded-[16px] border border-dashed border-[var(--tikkitte-cream-border)] px-5 py-10 text-center">
          <p className="text-sm font-semibold">No organizers in this view</p>
          <p className="mt-1 text-sm text-[var(--tikkitte-ink-faint)]">New organizer accounts will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--tikkitte-cream-border)]">
          {visibleOrganizers.map((organizer) => (
            <div key={organizer.id} className="px-5 py-4 transition-colors hover:bg-[var(--tikkitte-cream)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  {organizer.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={organizer.logo_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="create-display flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2e6fe6] text-xs text-white">
                      {initialsFor(organizer.display_name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{organizer.display_name}</p>
                      {organizer.approved && (
                        <span className="rounded-full bg-[#d9e4fa] px-2.5 py-1 text-[10px] font-bold uppercase text-[#2565d0]">
                          Approved
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-[var(--tikkitte-ink-soft)]">{organizer.email}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--tikkitte-ink-faint)]">
                      <span>Joined {formatDate(organizer.created_at)}</span>
                      {organizer.slug && (
                        <Link
                          href={`/o/${organizer.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="create-focus font-semibold text-[#2565d0] hover:text-[#1f56b5]"
                        >
                          View public profile
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!organizer.approved && (
                  <button
                    type="button"
                    onClick={() => runApprove(organizer.id)}
                    disabled={isPending && activeId === organizer.id}
                    className="create-focus min-h-11 shrink-0 rounded-full bg-[#2e6fe6] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2565d0] disabled:opacity-60"
                  >
                    {isPending && activeId === organizer.id ? 'Approving...' : 'Approve'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      </section>
    </div>
  )
}
