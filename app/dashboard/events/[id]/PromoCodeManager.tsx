'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { PromoCode, Ticket } from '@/lib/types'

type Props = {
  eventId: string
  tickets: Ticket[]
}

const inputClass = 'create-input min-h-11 text-sm placeholder:text-[var(--tikkitte-ink-faint)]'

export default function PromoCodeManager({ eventId, tickets }: Props) {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [showForm, setShowForm] = useState(false)
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent')
  const [discountValue, setDiscountValue] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [ticketTypeId, setTicketTypeId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const ticketMap = useMemo(() => {
    return tickets.reduce((acc: Record<string, Ticket>, ticket) => {
      acc[ticket.id] = ticket
      return acc
    }, {})
  }, [tickets])

  const loadCodes = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('promo_code')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
      return
    }
    setCodes((data ?? []) as PromoCode[])
  }

  useEffect(() => {
    loadCodes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId])

  const resetForm = () => {
    setCode('')
    setDiscountType('percent')
    setDiscountValue('')
    setMaxUses('')
    setTicketTypeId('')
  }

  const saveCode = async () => {
    setError(null)
    setMessage(null)
    const normalizedCode = code.trim().toUpperCase()
    const value = Number(discountValue)
    const max = maxUses ? parseInt(maxUses) : null

    if (!/^[A-Z0-9-]{3,20}$/.test(normalizedCode)) {
      setError('Code must be 3-20 characters using letters, numbers, or hyphens.')
      return
    }
    if (discountType === 'percent' && (!Number.isFinite(value) || value < 1 || value > 100)) {
      setError('Percent discount must be between 1 and 100.')
      return
    }
    if (discountType === 'fixed' && (!Number.isFinite(value) || value <= 0)) {
      setError('Fixed discount must be greater than 0.')
      return
    }
    if (max !== null && (!Number.isFinite(max) || max < 1)) {
      setError('Max uses must be at least 1, or blank for unlimited.')
      return
    }

    const selectedTicket = ticketTypeId ? ticketMap[ticketTypeId] : null
    if (discountType === 'fixed' && selectedTicket && value >= selectedTicket.price) {
      setMessage('Fixed discount is greater than or equal to the selected ticket price.')
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('promo_code').insert({
      event_id: eventId,
      code: normalizedCode,
      discount_type: discountType,
      discount_value: value,
      max_uses: max,
      ticket_type_id: ticketTypeId || null,
      active: true,
    })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }
    resetForm()
    setShowForm(false)
    await loadCodes()
  }

  const toggleActive = async (promoCode: PromoCode) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('promo_code')
      .update({ active: !promoCode.active })
      .eq('id', promoCode.id)
    if (error) {
      setError(error.message)
      return
    }
    setCodes((prev) => prev.map((item) => item.id === promoCode.id ? { ...item, active: !item.active } : item))
  }

  const deleteCode = async (promoCodeId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('promo_code').delete().eq('id', promoCodeId)
    if (error) {
      setError(error.message)
      return
    }
    setCodes((prev) => prev.filter((item) => item.id !== promoCodeId))
  }

  return (
    <div className="create-card p-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">Promo codes</h2>
          <p className="mt-1 text-xs text-[var(--tikkitte-ink-faint)]">Create discounts attendees can apply at checkout.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="create-focus min-h-10 rounded-full border border-[var(--tikkitte-cream-border)] px-5 text-sm font-semibold text-[#2565d0] hover:bg-[#f4f7fd]"
        >
          {showForm ? 'Cancel' : '+ Add promo code'}
        </button>
      </div>

      {showForm && (
        <div className="mb-5 rounded-[18px] border border-[var(--tikkitte-cream-border)] bg-[var(--tikkitte-cream)] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className={inputClass}
                placeholder="EARLY20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount type</label>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-white border border-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => setDiscountType('percent')}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${discountType === 'percent' ? 'bg-[#3d3d3d]/10 text-[#3d3d3d]' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Percent off
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('fixed')}
                  className={`rounded-md px-3 py-2 text-sm font-semibold transition-colors ${discountType === 'fixed' ? 'bg-[#3d3d3d]/10 text-[#3d3d3d]' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  Fixed amount off
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount value</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className={inputClass}
                placeholder={discountType === 'percent' ? '20' : '50'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max uses <span className="font-normal text-gray-400">(optional)</span></label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className={inputClass}
                placeholder="Unlimited"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Applies to</label>
              <select
                value={ticketTypeId}
                onChange={(e) => setTicketTypeId(e.target.value)}
                className={inputClass}
              >
                <option value="">All ticket types</option>
                {tickets.map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>{ticket.label}</option>
                ))}
              </select>
            </div>
          </div>
          {message && <p className="mt-3 text-sm text-amber-600">{message}</p>}
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <button
            type="button"
            onClick={saveCode}
            disabled={loading}
            className="create-focus mt-4 min-h-11 rounded-full bg-[#2e6fe6] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2565d0] disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save code'}
          </button>
        </div>
      )}

      {codes.length === 0 ? (
        <p className="text-sm text-gray-400">No promo codes yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 pr-4 font-medium text-gray-500">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Discount</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Uses</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Limit</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Active</th>
                <th className="text-right py-3 pl-4 font-medium text-gray-500">Delete</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((promoCode) => (
                <tr key={promoCode.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4 font-semibold text-gray-900">{promoCode.code}</td>
                  <td className="py-3 px-4 text-gray-600">{promoCode.discount_type === 'percent' ? 'Percent' : 'Fixed'}</td>
                  <td className="py-3 px-4 text-right text-gray-900 font-semibold">
                    {promoCode.discount_type === 'percent' ? `${promoCode.discount_value}%` : `GHS ${promoCode.discount_value}`}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">{promoCode.uses_count}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{promoCode.max_uses ?? 'Unlimited'}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleActive(promoCode)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${promoCode.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {promoCode.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <button
                      type="button"
                      onClick={() => deleteCode(promoCode.id)}
                      className="text-sm font-semibold text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
