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
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex w-fit items-center gap-1 rounded-xl bg-gray-100 p-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                tab === item.id ? 'bg-[#3d3d3d]/10 text-[#3d3d3d]' : 'text-gray-500 hover:bg-white'
              }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}

      {visibleOrganizers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-5 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">No organizers in this view</p>
          <p className="mt-1 text-sm text-gray-400">New organizer accounts will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {visibleOrganizers.map((organizer) => (
            <div key={organizer.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  {organizer.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={organizer.logo_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3d3d3d]/10 text-sm font-bold text-[#3d3d3d]">
                      {initialsFor(organizer.display_name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{organizer.display_name}</p>
                      {organizer.approved && (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                          APPROVED
                        </span>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-gray-600">{organizer.email}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span>Joined {formatDate(organizer.created_at)}</span>
                      {organizer.slug && (
                        <Link
                          href={`/o/${organizer.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-[#3d3d3d] hover:text-[#2a2a2a]"
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
                    className="shrink-0 rounded-lg bg-[#3d3d3d] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a] disabled:opacity-60"
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
  )
}
