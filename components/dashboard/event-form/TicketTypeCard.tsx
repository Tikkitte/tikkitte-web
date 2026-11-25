'use client'

import type { ReactNode } from 'react'
import { ACCENTS, ChevronDownIcon, Label, LockIcon, Note, Pill, TicketIcon, TrashIcon, fieldClass, iconButtonClass, textareaClass } from './ui'

export const TICKET_DESCRIPTION_MAX = 500

export type TicketRow = {
  id?: string
  label: string
  description: string
  price: string
  total_quantity: string
  purchased_quantity: number
  min_per_order: string
  max_per_order: string
  sale_start_date: string
  sale_start_time: string
  sale_end_date: string
  sale_end_time: string
  showAdvanced: boolean
}

export const emptyTicketRow: TicketRow = {
  label: '',
  description: '',
  price: '',
  total_quantity: '',
  purchased_quantity: 0,
  min_per_order: '1',
  max_per_order: '',
  sale_start_date: '',
  sale_start_time: '',
  sale_end_date: '',
  sale_end_time: '',
  showAdvanced: false,
}

function summary(row: TicketRow) {
  const price = Number(row.price)
  const priceText = row.price === '' || !Number.isFinite(price)
    ? 'No price yet'
    : price === 0 ? 'Free' : `GHS ${price.toLocaleString('en-GH', { maximumFractionDigits: 2 })}`
  const capacityText = row.total_quantity === '' ? 'Unlimited' : `${Number(row.total_quantity).toLocaleString('en-GH')} capacity`
  return `${priceText} · ${capacityText}`
}

function Field({ id, label, required, className = '', children }: { id: string; label: string; required?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <Label htmlFor={id} required={required}>{label}</Label>
      {children}
    </div>
  )
}

export default function TicketTypeCard({ row, index, canRemove, onChange, onRemove }: {
  row: TicketRow
  index: number
  canRemove: boolean
  onChange: <K extends keyof TicketRow>(field: K, value: TicketRow[K]) => void
  onRemove: () => void
}) {
  const id = (name: string) => `ticket-${index}-${name}`
  const name = row.label.trim()

  return (
    <div className="rounded-2xl border border-[var(--tikkitte-cream-border)] bg-[#fdfcfa] p-4 sm:p-[22px]">
      <div className="mb-[18px] flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-[10px]" style={{ background: ACCENTS.tickets.tint, color: ACCENTS.tickets.color }}>
          <TicketIcon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`truncate text-base font-bold ${name ? 'text-[var(--tikkitte-ink)]' : 'text-[var(--tikkitte-ink-soft)]'}`}>{name || 'New ticket type'}</p>
          <p className="mt-0.5 text-[13px] text-[var(--tikkitte-ink-soft)]">{summary(row)}</p>
        </div>
        {canRemove
          ? <button type="button" onClick={onRemove} aria-label={`Remove ${name || 'ticket type'}`} className={iconButtonClass}><TrashIcon /></button>
          : <Pill tone="muted"><LockIcon size={14} />Can’t remove</Pill>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <Field id={id('name')} label="Name" required className="col-span-2">
          <input id={id('name')} required value={row.label} onChange={e => onChange('label', e.target.value)} placeholder="e.g. General, VIP" className={fieldClass} />
        </Field>
        <Field id={id('price')} label="Price (GHS)" required>
          <div className="relative">
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-bold text-[var(--tikkitte-ink-soft)]">GHS</span>
            <input id={id('price')} required type="number" min="0" step="0.01" inputMode="decimal" value={row.price} onChange={e => onChange('price', e.target.value)} placeholder="0" className={`${fieldClass} pl-14`} />
          </div>
        </Field>
        <Field id={id('capacity')} label="Capacity">
          <input id={id('capacity')} type="number" min="0" inputMode="numeric" value={row.total_quantity} onChange={e => onChange('total_quantity', e.target.value)} placeholder="Unlimited" className={fieldClass} />
        </Field>
      </div>

      <div className="mt-4">
        <Label htmlFor={id('description')}>Description</Label>
        <textarea
          id={id('description')}
          rows={3}
          maxLength={TICKET_DESCRIPTION_MAX}
          value={row.description}
          onChange={e => onChange('description', e.target.value)}
          placeholder="What’s included"
          className={`${textareaClass} h-[88px]`}
        />
        <p className="mt-1.5 text-right text-[12.5px] text-[var(--tikkitte-ink-soft)]">{row.description.length}/{TICKET_DESCRIPTION_MAX}</p>
      </div>

      <button
        type="button"
        aria-expanded={row.showAdvanced}
        aria-controls={id('more')}
        onClick={() => onChange('showAdvanced', !row.showAdvanced)}
        className="create-focus mt-1.5 inline-flex items-center gap-1.5 py-2 text-sm font-bold text-[var(--tikkitte-blue)] hover:text-[var(--tikkitte-blue-hover)]"
      >
        More settings
        <ChevronDownIcon className={`transition-transform ${row.showAdvanced ? 'rotate-180' : ''}`} />
      </button>

      {row.showAdvanced && (
        <div id={id('more')} className="mt-2 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-dashed border-[var(--tikkitte-cream-border)] pt-[18px] sm:grid-cols-4 sm:gap-x-4 sm:gap-y-[18px]">
          <Field id={id('min')} label="Min per order">
            <input id={id('min')} type="number" min="1" inputMode="numeric" value={row.min_per_order} onChange={e => onChange('min_per_order', e.target.value)} className={fieldClass} />
          </Field>
          <Field id={id('max')} label="Max per order">
            <input id={id('max')} type="number" min={row.min_per_order || '1'} inputMode="numeric" value={row.max_per_order} onChange={e => onChange('max_per_order', e.target.value)} placeholder="No limit" className={fieldClass} />
          </Field>
          <div aria-hidden="true" className="hidden sm:col-span-2 sm:block" />
          <Field id={id('sale-start-date')} label="Sale start date">
            <input id={id('sale-start-date')} type="date" value={row.sale_start_date} onChange={e => onChange('sale_start_date', e.target.value)} className={fieldClass} />
          </Field>
          <Field id={id('sale-start-time')} label="Sale start time">
            <input id={id('sale-start-time')} type="time" value={row.sale_start_time} onChange={e => onChange('sale_start_time', e.target.value)} className={fieldClass} />
          </Field>
          <Field id={id('sale-end-date')} label="Sale end date">
            <input id={id('sale-end-date')} type="date" min={row.sale_start_date || undefined} value={row.sale_end_date} onChange={e => onChange('sale_end_date', e.target.value)} className={fieldClass} />
          </Field>
          <Field id={id('sale-end-time')} label="Sale end time">
            <input id={id('sale-end-time')} type="time" value={row.sale_end_time} onChange={e => onChange('sale_end_time', e.target.value)} className={fieldClass} />
          </Field>
        </div>
      )}

      {!canRemove && <Note icon={<LockIcon size={15} />} className="mt-4">Saved ticket types can’t be removed once the event is published.</Note>}
    </div>
  )
}
