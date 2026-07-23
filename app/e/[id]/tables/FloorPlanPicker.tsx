'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatGhs } from '@/lib/aria-tables'
import AriaFloorPlanSvg, { type TableStyle } from '@/components/AriaFloorPlanSvg'
import type { TablePackage } from '@/lib/types'
import TableContact from './TableContact'

// "Gallery" palette — warm paper background, ink hairlines, teal accent —
// matching tikkitte-web/design/GuestPageGallery.tsx so the guest booking
// flow reads as part of the main site rather than a separate dark theme.
const ACCENT = '#1596B7'

type Props = {
  eventId: string
  eventSlug: string
  eventName: string
  initialPackages: TablePackage[]
}

function normalizePackages(packages: TablePackage[]) {
  return packages.map((table) => ({
    ...table,
    guest_capacity: Number(table.guest_capacity),
    min_spend: Number(table.min_spend),
    deposit: Number(table.deposit),
    bottles: table.bottles ?? [],
  }))
}

export default function FloorPlanPicker({ eventId, eventSlug, eventName, initialPackages }: Props) {
  const [packages, setPackages] = useState(() => normalizePackages(initialPackages))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [refreshError, setRefreshError] = useState(false)

  const packageByCode = useMemo(
    () => new Map(packages.map((table) => [table.table_code, table])),
    [packages],
  )
  const selected = packages.find((table) => table.id === selectedId) ?? null

  const refresh = useCallback(async () => {
    const supabase = createClient()
    const { data, error } = await supabase.rpc('get_public_event_tables', { p_event_id: eventId })
    if (error || !data) {
      setRefreshError(true)
      return
    }
    const next = normalizePackages(data as TablePackage[])
    setPackages(next)
    setRefreshError(false)
    setSelectedId((current) => {
      if (!current) return null
      const currentTable = next.find((table) => table.id === current)
      return currentTable?.enabled && currentTable.reservation_status === 'available' ? current : null
    })
  }, [eventId])

  useEffect(() => {
    const interval = window.setInterval(refresh, 15_000)
    return () => window.clearInterval(interval)
  }, [refresh])

  const selectTable = (table: TablePackage | undefined) => {
    if (!table?.enabled || table.reservation_status !== 'available') return
    setSelectedId(table.id)
  }

  return (
    <div className="min-h-screen bg-[#F6F4EF] px-3 py-6 text-[#17110E] sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/e/${eventSlug}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[rgba(23,17,14,0.62)] hover:text-[#17110E]"
        >
          <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[rgba(23,17,14,0.14)] bg-[#FDFCFA] shadow-sm transition-colors hover:bg-white">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </span>
          Back to event
        </Link>
        <div className="mb-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#1596B7]">ARIA table reservations</p>
          <h1 className="mt-2 font-anton text-3xl uppercase text-[#17110E] sm:text-5xl">{eventName}</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[rgba(23,17,14,0.62)]">Choose an available table, review its package, and message us on WhatsApp to reserve.</p>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-3xl border border-[rgba(23,17,14,0.14)] bg-[#FDFCFA] p-2 shadow-sm sm:p-4">
            <AriaFloorPlanSvg
              packages={packages}
              selectedCode={selected?.table_code ?? null}
              onSelect={(code) => selectTable(packageByCode.get(code))}
              isSelectable={(table) => !!table?.enabled && table.reservation_status === 'available'}
              theme="light"
              accentColor={ACCENT}
              getTableStyle={(table, isSelected): TableStyle => {
                const available = !!table?.enabled && table.reservation_status === 'available'
                return {
                  fill: isSelected ? ACCENT : available ? 'rgba(23,17,14,0.02)' : 'url(#aria-unavailable)',
                  fillOpacity: 1,
                  stroke: isSelected || available ? ACCENT : 'rgba(23,17,14,0.4)',
                  strokeOpacity: isSelected ? 1 : available ? 0.55 : 0.3,
                }
              }}
            />

            <div className="flex flex-wrap items-center justify-center gap-4 border-t border-[rgba(23,17,14,0.12)] px-3 py-4 text-xs text-[rgba(23,17,14,0.55)]">
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-[#1596B7]" />Available</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-[#1596B7]" />Selected</span>
              <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm border border-[rgba(23,17,14,0.2)] bg-[rgba(23,17,14,0.04)]" />Unavailable</span>
            </div>
          </div>

          <aside className="rounded-3xl border border-[rgba(23,17,14,0.14)] bg-[#FDFCFA] p-5 lg:sticky lg:top-24">
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1596B7]">Table {selected.table_code}</p>
                    <h2 className="mt-1 text-3xl font-bold text-[#17110E]">{selected.tier_name}</h2>
                  </div>
                  <button type="button" onClick={() => setSelectedId(null)} className="text-sm text-[rgba(23,17,14,0.45)] hover:text-[#17110E]" aria-label="Clear table selection">×</button>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-3"><span className="text-[rgba(23,17,14,0.48)]">Seats</span><span className="font-semibold text-[#17110E]">Up to {selected.guest_capacity} guests</span></div>
                  <div className="flex justify-between gap-3"><span className="text-[rgba(23,17,14,0.48)]">Minimum spend</span><span className="font-semibold text-[#17110E]">{formatGhs(selected.min_spend)}</span></div>
                </div>
                {selected.bottles.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-[rgba(23,17,14,0.14)] bg-[rgba(23,17,14,0.03)] p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[rgba(23,17,14,0.45)]">Bottle package</p>
                    <ul className="mt-2 space-y-1 text-sm text-[rgba(23,17,14,0.75)]">{selected.bottles.map((bottle, index) => <li key={`${bottle}-${index}`}>• {bottle}</li>)}</ul>
                  </div>
                )}
                <TableContact table={selected} />
              </>
            ) : (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#1596B7]/30 text-[#1596B7]">⌁</div>
                <h2 className="mt-4 text-lg font-semibold text-[#17110E]">Choose a table</h2>
                <p className="mt-2 text-sm leading-6 text-[rgba(23,17,14,0.48)]">Tap any available table on the floor plan to see its details and reserve.</p>
                {refreshError && <p className="mt-4 text-xs text-amber-700">Live availability could not refresh. Please try again shortly.</p>}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
