'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatGhs } from '@/lib/aria-tables'
import AriaFloorPlanSvg, { type TableStyle } from '@/components/AriaFloorPlanSvg'
import type { TablePackage } from '@/lib/types'

type Props = {
  eventId: string
  initialPackages: TablePackage[]
  initialLive: boolean
}

function normalizePackage(value: TablePackage): TablePackage {
  return {
    ...value,
    guest_capacity: Number(value.guest_capacity),
    min_spend: Number(value.min_spend),
    deposit: Number(value.deposit),
    bottles: value.bottles ?? [],
  }
}

function editablePackageSnapshot(value: TablePackage) {
  return JSON.stringify({
    tier_name: value.tier_name.trim(),
    guest_capacity: Number(value.guest_capacity),
    min_spend: Number(value.min_spend),
    deposit: Number(value.deposit),
    bottles: value.bottles.map((bottle) => bottle.trim()).filter(Boolean),
    enabled: value.enabled,
  })
}

function statusLabel(status: TablePackage['reservation_status']) {
  if (status === 'awaiting_payment') return 'Payment in progress'
  if (status === 'booked') return 'Booked'
  return 'Available'
}

const MAP_ACCENT = '#2e6fe6'

function getMapTableStyle(table: TablePackage | undefined, isSelected: boolean): TableStyle {
  if (isSelected) {
    return { fill: MAP_ACCENT, fillOpacity: 1, stroke: MAP_ACCENT, strokeOpacity: 1 }
  }
  if (!table?.enabled) {
    return { fill: 'url(#aria-unavailable)', fillOpacity: 1, stroke: 'rgba(23,17,14,0.4)', strokeOpacity: 0.3 }
  }
  if (table.reservation_status === 'booked') {
    return { fill: '#191917', fillOpacity: 1, stroke: '#191917', strokeOpacity: 1 }
  }
  if (table.reservation_status === 'awaiting_payment') {
    return { fill: '#F59E0B', fillOpacity: 0.3, stroke: '#D97706', strokeOpacity: 0.7 }
  }
  return { fill: 'rgba(23,17,14,0.02)', fillOpacity: 1, stroke: MAP_ACCENT, strokeOpacity: 0.55 }
}

function PackageEditor({
  value,
  onSaved,
}: {
  value: TablePackage
  onSaved: (value: TablePackage) => void
}) {
  const [draft, setDraft] = useState(value)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const editable = value.reservation_status === 'available'
  const isDirty = editablePackageSnapshot(draft) !== editablePackageSnapshot(value)
  const inputClass = 'create-input mt-1 min-h-11 text-sm disabled:bg-[var(--tikkitte-cream)] disabled:text-[var(--tikkitte-ink-faint)]'

  const updateDraft = (update: (current: TablePackage) => TablePackage) => {
    setDraft(update)
    setMessage(null)
  }

  // The editor is keyed by table id in the parent, so this only remounts (resetting
  // draft/message state) when the selected table actually changes.

  const save = async () => {
    setSaving(true)
    setMessage(null)
    const supabase = createClient()
    const { data, error } = await supabase.rpc('update_table_package', {
      p_package_id: value.id,
      p_tier_name: draft.tier_name.trim(),
      p_guest_capacity: Number(draft.guest_capacity),
      p_min_spend: Number(draft.min_spend),
      p_deposit: Number(draft.deposit),
      p_bottles: draft.bottles.map((bottle) => bottle.trim()).filter(Boolean),
      p_enabled: draft.enabled,
    })
    if (error || !data) {
      setMessage(error?.message.includes('ERR_PACKAGE_LOCKED')
        ? 'This table changed while you were editing. Refresh to see its status.'
        : 'Could not save this table.')
      setSaving(false)
      return
    }
    const saved = normalizePackage(data as TablePackage)
    setDraft(saved)
    onSaved(saved)
    setMessage('Saved')
    setSaving(false)
  }

  return (
    <div className="mt-4 border-t border-[var(--tikkitte-cream-border)] pt-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="create-display text-[28px]">{value.table_code}</p>
            <span className="rounded-full bg-[var(--tikkitte-cream)] px-3 py-1 text-[10px] font-bold uppercase text-[var(--tikkitte-ink-soft)]">{value.table_kind}</span>
          </div>
          <p className={`mt-1 text-xs font-semibold ${value.reservation_status === 'available' ? 'text-emerald-600' : value.reservation_status === 'booked' ? 'text-gray-500' : 'text-amber-600'}`}>
            {statusLabel(value.reservation_status)}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={draft.enabled}
            disabled={!editable}
            onChange={(event) => updateDraft((current) => ({ ...current, enabled: event.target.checked }))}
            className="h-4 w-4 rounded border-gray-300"
          />
          Enabled
        </label>
      </div>

      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-gray-500">
            Tier name
            <input className={`${inputClass} mt-1`} value={draft.tier_name} disabled={!editable} onChange={(event) => updateDraft((current) => ({ ...current, tier_name: event.target.value }))} />
          </label>
          <label className="text-xs font-medium text-gray-500">
            Guest capacity
            <input className={`${inputClass} mt-1`} type="number" min={1} max={50} value={draft.guest_capacity} disabled={!editable} onChange={(event) => updateDraft((current) => ({ ...current, guest_capacity: Number(event.target.value) }))} />
          </label>
        </div>
        <label className="text-xs font-medium text-gray-500">
          Minimum spend (GHS)
          <input className={`${inputClass} mt-1`} type="number" min={0} value={draft.min_spend} disabled={!editable} onChange={(event) => updateDraft((current) => ({ ...current, min_spend: Number(event.target.value) }))} />
        </label>
        <label className="text-xs font-medium text-gray-500">
          Deposit (GHS)
          <input className={`${inputClass} mt-1`} type="number" min={1} value={draft.deposit} disabled={!editable} onChange={(event) => updateDraft((current) => ({ ...current, deposit: Number(event.target.value) }))} />
        </label>
      </div>

      <label className="mt-3 block text-xs font-medium text-gray-500">
        Bottles — one per line
        <textarea
          className={`${inputClass} mt-1 min-h-24 resize-y`}
          value={draft.bottles.join('\n')}
          disabled={!editable}
          onChange={(event) => updateDraft((current) => ({ ...current, bottles: event.target.value.split('\n') }))}
        />
      </label>

      {editable && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={saving || !isDirty} className="create-focus min-h-11 rounded-full bg-[#2e6fe6] px-6 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Saving…' : 'Save table'}
          </button>
          {isDirty && (
            <p role="status" className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              Save this table to apply your changes.
            </p>
          )}
          {message && <p className="text-xs text-gray-500">{message}</p>}
        </div>
      )}
    </div>
  )
}

export default function TablePackageManager({ eventId, initialPackages, initialLive }: Props) {
  const [packages, setPackages] = useState(initialPackages.map(normalizePackage))
  const [selectedCode, setSelectedCode] = useState<string | null>(initialPackages[0]?.table_code ?? null)
  const [settingUp, setSettingUp] = useState(false)
  const [live, setLive] = useState(initialLive)
  const [togglingLive, setTogglingLive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const booked = packages.filter((table) => table.reservation_status === 'booked')
  const expectedGuests = booked.reduce((sum, table) => sum + table.guest_capacity, 0)
  const deposits = booked.reduce((sum, table) => sum + table.deposit, 0)
  const selected = packages.find((table) => table.table_code === selectedCode) ?? null

  const setup = async () => {
    setSettingUp(true)
    setError(null)
    const supabase = createClient()
    const { data, error: setupError } = await supabase.rpc('setup_aria_tables', { p_event_id: eventId })
    const nextPackages = data && typeof data === 'object' && 'packages' in data
      ? (data as { packages?: TablePackage[] }).packages
      : null
    if (setupError || !nextPackages) {
      setError('Could not set up ARIA tables.')
      setSettingUp(false)
      return
    }
    const normalized = nextPackages.map(normalizePackage)
    setPackages(normalized)
    setSelectedCode(normalized[0]?.table_code ?? null)
    setSettingUp(false)
  }

  const toggleLive = async (nextLive: boolean) => {
    setTogglingLive(true)
    setError(null)
    const supabase = createClient()
    const { data, error: liveError } = await supabase.rpc('set_aria_tables_live', {
      p_event_id: eventId,
      p_live: nextLive,
    })
    if (liveError || data === null) {
      setError(nextLive ? 'Could not go live.' : 'Could not take tables offline.')
      setTogglingLive(false)
      return
    }
    setLive(Boolean(data))
    setTogglingLive(false)
  }

  const updatePackage = (saved: TablePackage) => {
    setPackages((current) => current.map((item) => item.id === saved.id ? saved : item))
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">ARIA floor plan</h2>
          <p className="mt-1 text-sm text-[var(--tikkitte-ink-faint)]">Fixed 22-table plan · select an available table to edit.</p>
        </div>
        {packages.length === 0 ? (
          <button type="button" onClick={setup} disabled={settingUp} className="create-focus min-h-11 rounded-full bg-[#2e6fe6] px-6 text-sm font-semibold text-white disabled:opacity-50">
            {settingUp ? 'Setting up…' : 'Set up ARIA tables'}
          </button>
        ) : live ? (
          <div className="flex items-center gap-3">
            <span className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--tikkitte-cream-border)] bg-white px-5 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-[#2e6fe6]" />Live · visible to guests</span>
            <button type="button" onClick={() => toggleLive(false)} disabled={togglingLive} className="create-focus min-h-11 rounded-full border border-[var(--tikkitte-cream-border)] bg-white px-5 text-sm font-semibold disabled:opacity-50">
              {togglingLive ? 'Working…' : 'Take offline'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--tikkitte-cream-border)] bg-white px-5 text-sm font-semibold"><span className="h-2 w-2 rounded-full bg-amber-500" />Not visible to guests</span>
            <button type="button" onClick={() => toggleLive(true)} disabled={togglingLive} className="create-focus min-h-11 rounded-full bg-[#2e6fe6] px-6 text-sm font-semibold text-white disabled:opacity-50">
              {togglingLive ? 'Working…' : 'Go live'}
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {packages.length > 0 && !live && (
        <p className="mt-3 text-xs text-gray-500">Edit prices, tiers, and bottles below, then click Go live when you&apos;re ready for guests to see and reserve these tables.</p>
      )}

      {packages.length > 0 && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="create-card p-5"><p className="text-sm text-[var(--tikkitte-ink-faint)]">Tables booked</p><p className="create-display mt-1 text-[30px]">{booked.length}<span className="ml-1 text-lg text-[var(--tikkitte-ink-faint)]">/{packages.length}</span></p></div>
            <div className="create-card p-5"><p className="text-sm text-[var(--tikkitte-ink-faint)]">Expected table guests</p><p className="create-display mt-1 text-[30px]">{expectedGuests}</p></div>
            <div className="create-card p-5"><p className="text-sm text-[var(--tikkitte-ink-faint)]">Deposits collected</p><p className="create-display mt-1 text-[30px]">{formatGhs(deposits)}</p></div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="create-card overflow-hidden p-4">
              <div className="p-2">
                <AriaFloorPlanSvg
                  packages={packages}
                  selectedCode={selectedCode}
                  onSelect={setSelectedCode}
                  getTableStyle={getMapTableStyle}
                  theme="light"
                  accentColor={MAP_ACCENT}
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[var(--tikkitte-cream-border)] px-2 py-3 text-[11px] text-[var(--tikkitte-ink-faint)]">
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-[#2e6fe6]" />Available</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-500" />In progress</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gray-500" />Booked</span>
                <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border border-[rgba(23,17,14,0.2)] bg-[rgba(23,17,14,0.04)]" />Disabled</span>
              </div>
            </div>

            <div className="create-card p-5">
              <label className="block text-xs font-medium text-gray-500">
                Table
                <select
                  className="create-input mt-1 min-h-11 text-sm"
                  value={selectedCode ?? ''}
                  onChange={(event) => setSelectedCode(event.target.value)}
                >
                  {packages.map((table) => (
                    <option key={table.id} value={table.table_code}>
                      {table.table_code} — {statusLabel(table.reservation_status)}{!table.enabled ? ' (disabled)' : ''}
                    </option>
                  ))}
                </select>
              </label>

              {selected && (
                <div className="mt-3">
                  <PackageEditor key={selected.id} value={selected} onSaved={updatePackage} />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
