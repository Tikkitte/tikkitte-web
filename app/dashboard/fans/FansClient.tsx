'use client'

import { useMemo, useState } from 'react'

export type FanRow = {
  user_id: string
  email: string | null
  name: string | null
  event_count: number
  ticket_count: number
}

type Props = {
  fans: FanRow[]
}

function exportCSV(filename: string, headers: string[], rows: string[][]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const inputClass = 'w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3d3d3d]'
const exportButtonClass = 'rounded-lg border border-[#3d3d3d] px-4 py-2 text-sm font-semibold text-[#3d3d3d] transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'

export default function FansClient({ fans }: Props) {
  const [search, setSearch] = useState('')
  const normalizedSearch = search.trim().toLowerCase()

  const filteredFans = useMemo(() => (
    fans.filter((fan) => (
      !normalizedSearch ||
      (fan.name ?? '').toLowerCase().includes(normalizedSearch) ||
      (fan.email ?? '').toLowerCase().includes(normalizedSearch)
    ))
  ), [fans, normalizedSearch])

  const exportFans = () => {
    exportCSV(
      'fans.csv',
      ['Name', 'Email', 'Events', 'Tickets'],
      filteredFans.map((fan) => [
        fan.name || '—',
        fan.email || '—',
        String(fan.event_count),
        String(fan.ticket_count),
      ]),
    )
  }

  if (fans.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400" aria-hidden="true">
            <path d="M16 20v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V20" />
            <circle cx="9.5" cy="7.5" r="3.5" />
            <path d="M21 20v-1.5a4 4 0 0 0-3-3.9" />
            <path d="M16 4.1a3.5 3.5 0 0 1 0 6.8" />
          </svg>
        </div>
        <p className="font-semibold text-gray-700">No fans yet</p>
        <p className="mt-1 text-sm text-gray-500">When fans buy tickets to your events, they&apos;ll appear here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-sm">
          <label htmlFor="fan-search" className="sr-only">Search fans</label>
          <input
            id="fan-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={inputClass}
            placeholder="Search by name or email..."
          />
        </div>
        <button type="button" onClick={exportFans} disabled={filteredFans.length === 0} className={exportButtonClass}>
          Export CSV
        </button>
      </div>

      <p className="text-sm text-gray-500">
        Showing {filteredFans.length} fan{filteredFans.length === 1 ? '' : 's'}
      </p>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Events</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {filteredFans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">
                    No fans match your search.
                  </td>
                </tr>
              ) : (
                filteredFans.map((fan) => (
                  <tr key={fan.user_id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3 font-medium text-gray-900">{fan.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{fan.email || '—'}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">{fan.event_count}</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">{fan.ticket_count}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
