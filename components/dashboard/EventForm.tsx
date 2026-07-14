'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Event, Ticket } from '@/lib/types'

type TicketRow = {
  id?: string
  label: string
  price: string
  total_quantity: string
  min_per_order: string
  max_per_order: string
  sale_start_date: string
  sale_start_time: string
  sale_end_date: string
  sale_end_time: string
  showAdvanced: boolean
}

type Props = {
  event?: Event
  tickets?: Ticket[]
  organizerId: string
  showPreview?: boolean
}

const emptyTicketRow: TicketRow = {
  label: '',
  price: '',
  total_quantity: '',
  min_per_order: '1',
  max_per_order: '',
  sale_start_date: '',
  sale_start_time: '',
  sale_end_date: '',
  sale_end_time: '',
  showAdvanced: false,
}

function formatPreviewDate(dateStr: string) {
  if (!dateStr) return 'Date TBA'
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

function formatPreviewTime(timeStr: string) {
  if (!timeStr) return 'Time TBA'
  const [hh, mm] = timeStr.split(':').map(Number)
  const am = hh < 12
  const h12 = ((hh + 11) % 12) + 1
  return `${h12}:${String(mm).padStart(2, '0')} ${am ? 'AM' : 'PM'}`
}

function EventPreviewCard({
  name,
  date,
  time,
  venue,
  imageUrl,
  ticketRows,
}: {
  name: string
  date: string
  time: string
  venue: string
  imageUrl: string | null
  ticketRows: TicketRow[]
}) {
  const validPrices = ticketRows
    .map((row) => Number(row.price))
    .filter((price) => Number.isFinite(price) && price >= 0)
  const lowestPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0
  const priceLabel = lowestPrice > 0
    ? `From GHS ${lowestPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : 'Free'

  return (
    <div className="hidden lg:block">
      <div className="sticky top-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Preview</p>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="aspect-[9/16] w-full bg-gray-100">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                </svg>
              </div>
            )}
          </div>
          <div className="p-5">
            <h3 className={`line-clamp-1 font-semibold ${name.trim() ? 'text-gray-900' : 'italic text-gray-400'}`}>
              {name.trim() || 'Your event name'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{formatPreviewDate(date)} &middot; {formatPreviewTime(time)}</p>
            <p className="mt-1 line-clamp-1 text-sm text-gray-400">{venue.trim() || 'Venue TBA'}</p>
            <p className="mt-4 text-sm font-semibold text-[#3d3d3d]">{priceLabel}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EventForm({ event, tickets, organizerId, showPreview = false }: Props) {
  const router = useRouter()
  const isEdit = !!event
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(event?.name ?? '')
  const [date, setDate] = useState(event?.date ?? '')
  const [time, setTime] = useState(event?.time ? event.time.slice(0, 5) : '')
  const [endDate, setEndDate] = useState(event?.end_date ?? '')
  const [endTime, setEndTime] = useState(event?.end_time ? event.end_time.slice(0, 5) : '')
  const [published] = useState(event?.published ?? true)
  const [venue, setVenue] = useState(event?.venue ?? '')
  const [mapsLink, setMapsLink] = useState(event?.maps_link ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [imageUrl, setImageUrl] = useState<string | null>(event?.image?.[0] ?? null)
  const [imageUploading, setImageUploading] = useState(false)
  const [ticketRows, setTicketRows] = useState<TicketRow[]>(
    tickets && tickets.length > 0
      ? tickets.map(t => ({
          id: t.id,
          label: t.label,
          price: String(t.price),
          total_quantity: t.total_quantity != null ? String(t.total_quantity) : '',
          min_per_order: String(t.min_per_order ?? 1),
          max_per_order: t.max_per_order != null ? String(t.max_per_order) : '',
          sale_start_date: t.sale_start_date ?? '',
          sale_start_time: t.sale_start_time ? t.sale_start_time.slice(0, 5) : '',
          sale_end_date: t.sale_end_date ?? '',
          sale_end_time: t.sale_end_time ? t.sale_end_time.slice(0, 5) : '',
          showAdvanced: false,
        }))
      : [{ ...emptyTicketRow }]
  )
  const [previewImages, setPreviewImages] = useState<string[]>(event?.preview_images ?? [])
  const [previewVideos, setPreviewVideos] = useState<string[]>(event?.preview_videos ?? [])
  const [previewUploading, setPreviewUploading] = useState(false)
  const previewFileRef = useRef<HTMLInputElement>(null)
  const [scannerPin, setScannerPin] = useState(event?.scanner_pin ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePreviewImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, WebP, and GIF images are allowed.')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be under 5 MB.')
        return
      }
    }

    setPreviewUploading(true)
    setError(null)
    const supabase = createClient()
    const uploaded: string[] = []

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const path = `${organizerId}/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(path, file, { contentType: file.type, upsert: true })
      if (uploadError) {
        setError('Upload failed: ' + uploadError.message)
        setPreviewUploading(false)
        return
      }
      const { data } = supabase.storage.from('event-images').getPublicUrl(path)
      uploaded.push(data.publicUrl)
    }

    setPreviewImages(prev => [...prev, ...uploaded])
    setPreviewUploading(false)
    // Reset input so same files can be re-selected if needed
    if (previewFileRef.current) previewFileRef.current.value = ''
  }

  const removePreviewImage = (i: number) => {
    setPreviewImages(prev => prev.filter((_, idx) => idx !== i))
  }

  const addVideoUrl = () => {
    setPreviewVideos(prev => [...prev, ''])
  }

  const updateVideoUrl = (i: number, value: string) => {
    setPreviewVideos(prev => prev.map((v, idx) => idx === i ? value : v))
  }

  const removeVideoUrl = (i: number) => {
    setPreviewVideos(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, WebP, and GIF images are allowed.')
      return
    }

    // Validate file size (5 MB max)
    const MAX_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      setError('Image must be under 5 MB.')
      return
    }

    setImageUploading(true)
    setError(null)
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const safeName = crypto.randomUUID()
    const path = `${organizerId}/${safeName}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(path, file, { contentType: file.type, upsert: true })
    if (uploadError) {
      setError('Image upload failed: ' + uploadError.message)
      setImageUploading(false)
      return
    }
    const { data } = supabase.storage.from('event-images').getPublicUrl(path)
    setImageUrl(data.publicUrl)
    setImageUploading(false)
  }

  const addTicketRow = () => {
    setTicketRows(r => [...r, { ...emptyTicketRow }])
  }

  const removeTicketRow = (i: number) => {
    setTicketRows(r => r.filter((_, idx) => idx !== i))
  }

  const updateTicketRow = <K extends keyof TicketRow>(i: number, field: K, value: TicketRow[K]) => {
    setTicketRows(r => r.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  const validateEventDateRange = () => {
    if (endTime && !endDate) {
      setError('Add an end date before setting an end time.')
      return false
    }
    if (!endDate) return true
    if (endDate < date) {
      setError('End date cannot be before the start date.')
      return false
    }
    if (endDate === date && endTime && time && endTime <= time) {
      setError('End time must be after the start time when the event ends on the same day.')
      return false
    }
    return true
  }

  const validateTicketRows = () => {
    for (const row of ticketRows) {
      const label = row.label.trim() || 'Each ticket type'
      const minPerOrder = parseInt(row.min_per_order || '1')
      const maxPerOrder = row.max_per_order ? parseInt(row.max_per_order) : null

      if (!row.label.trim() || !row.price) {
        setError('Each ticket type needs a label and price.')
        return false
      }
      if (!Number.isFinite(minPerOrder) || minPerOrder < 1) {
        setError(`${label} needs a minimum order quantity of at least 1.`)
        return false
      }
      if (maxPerOrder !== null && (!Number.isFinite(maxPerOrder) || maxPerOrder < minPerOrder)) {
        setError(`${label} max per order must be greater than or equal to min per order.`)
        return false
      }
      if (row.sale_start_time && !row.sale_start_date) {
        setError(`${label} needs a sale start date before setting a sale start time.`)
        return false
      }
      if (row.sale_end_time && !row.sale_end_date) {
        setError(`${label} needs a sale end date before setting a sale end time.`)
        return false
      }
      if (row.sale_start_date && row.sale_end_date) {
        const saleStart = `${row.sale_start_date}T${row.sale_start_time || '00:00'}`
        const saleEnd = `${row.sale_end_date}T${row.sale_end_time || '23:59'}`
        if (saleEnd <= saleStart) {
          setError(`${label} sale end must be after sale start.`)
          return false
        }
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (ticketRows.length === 0) {
      setError('Add at least one ticket type.')
      return
    }
    if (!validateEventDateRange()) return
    if (!validateTicketRows()) return

    setLoading(true)
    const supabase = createClient()

    if (isEdit && event) {
      // Update event
      const { error: eventError } = await supabase
        .from('event')
        .update({
          name,
          date,
          time: time + ':00',
          end_date: endDate || null,
          end_time: endTime ? endTime + ':00' : null,
          venue: venue || null,
          maps_link: mapsLink || null,
          description: description || null,
          image: imageUrl ? [imageUrl] : event.image,
          preview_images: previewImages.length > 0 ? previewImages : null,
          preview_videos: previewVideos.filter(v => v.trim()).length > 0 ? previewVideos.filter(v => v.trim()) : null,
          scanner_pin: scannerPin.trim() || null,
          published,
        })
        .eq('id', event.id)

      if (eventError) { setError(eventError.message); setLoading(false); return }

      // Delete removed tickets, upsert existing
      const existingIds = ticketRows.filter(r => r.id).map(r => r.id!)
      const { data: currentTickets } = await supabase
        .from('ticket')
        .select('id')
        .eq('event_id', event.id)

      const toDelete = (currentTickets ?? [])
        .filter((t: { id: string }) => !existingIds.includes(t.id))
        .map((t: { id: string }) => t.id)

      if (toDelete.length > 0) {
        await supabase.from('ticket').delete().in('id', toDelete)
      }

      for (let i = 0; i < ticketRows.length; i++) {
        const row = ticketRows[i]
        const payload = {
          event_id: event.id,
          label: row.label,
          price: parseFloat(row.price),
          total_quantity: row.total_quantity ? parseInt(row.total_quantity) : null,
          min_per_order: parseInt(row.min_per_order || '1'),
          max_per_order: row.max_per_order ? parseInt(row.max_per_order) : null,
          sale_start_date: row.sale_start_date || null,
          sale_start_time: row.sale_start_time ? row.sale_start_time + ':00' : null,
          sale_end_date: row.sale_end_date || null,
          sale_end_time: row.sale_end_time ? row.sale_end_time + ':00' : null,
          type: i + 1,
        }
        if (row.id) {
          await supabase.from('ticket').update(payload).eq('id', row.id)
        } else {
          await supabase.from('ticket').insert(payload)
        }
      }

      router.push(`/dashboard/events/${event.id}`)
      router.refresh()
    } else {
      // Create event
      const { data: newEvent, error: eventError } = await supabase
        .from('event')
        .insert({
          name,
          date,
          time: time + ':00',
          end_date: endDate || null,
          end_time: endTime ? endTime + ':00' : null,
          venue: venue || null,
          maps_link: mapsLink || null,
          description: description || null,
          image: imageUrl ? [imageUrl] : null,
          preview_images: previewImages.length > 0 ? previewImages : null,
          preview_videos: previewVideos.filter(v => v.trim()).length > 0 ? previewVideos.filter(v => v.trim()) : null,
          scanner_pin: scannerPin.trim() || null,
          organizer_id: organizerId,
          cancelled: false,
          published: false,
        })
        .select('id')
        .single()

      if (eventError || !newEvent) { setError(eventError?.message ?? 'Failed to create event'); setLoading(false); return }

      for (let i = 0; i < ticketRows.length; i++) {
        const row = ticketRows[i]
        await supabase.from('ticket').insert({
          event_id: newEvent.id,
          label: row.label,
          price: parseFloat(row.price),
          total_quantity: row.total_quantity ? parseInt(row.total_quantity) : null,
          min_per_order: parseInt(row.min_per_order || '1'),
          max_per_order: row.max_per_order ? parseInt(row.max_per_order) : null,
          sale_start_date: row.sale_start_date || null,
          sale_start_time: row.sale_start_time ? row.sale_start_time + ':00' : null,
          sale_end_date: row.sale_end_date || null,
          sale_end_time: row.sale_end_time ? row.sale_end_time + ':00' : null,
          type: i + 1,
          purchased_quantity: 0,
          available_quantity: row.total_quantity ? parseInt(row.total_quantity) : null,
        })
      }

      router.push(`/dashboard/events/${newEvent.id}`)
      router.refresh()
    }
    setLoading(false)
  }

  const baseSlug = name.trim()
    ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60)
    : ''

  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [resolvedSlug, setResolvedSlug] = useState('')

  useEffect(() => {
    if (!baseSlug) {
      return
    }

    const timer = setTimeout(async () => {
      setSlugStatus('checking')
      const supabase = createClient()
      const { data } = await supabase
        .from('event')
        .select('id, slug')
        .eq('slug', baseSlug)
        .maybeSingle()

      if (!data || (event && data.id === event.id)) {
        setResolvedSlug(baseSlug)
        setSlugStatus('available')
      } else {
        // Slug taken — append a short random suffix
        const suffix = Math.random().toString(36).slice(2, 6)
        setResolvedSlug(baseSlug + '-' + suffix)
        setSlugStatus('taken')
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [baseSlug, event])

  const slugPreview = resolvedSlug ? 'tikkitte.com/e/' + resolvedSlug : ''

  const inputClass = 'w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3d3d] placeholder:text-gray-400'

  const form = (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto w-full flex flex-col gap-6">
      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">Event details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event name</label>
          <input required value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. Saturday Night Lights" />
          {baseSlug && (
            <p className="text-xs mt-1 flex items-center gap-1.5">
              {slugStatus === 'checking' ? (
                <span className="text-gray-400">Checking tikkitte.com/e/{baseSlug}...</span>
              ) : slugStatus === 'available' ? (
                <>
                  <span className="text-green-600">&#10003;</span>
                  <span className="text-gray-400">{slugPreview}</span>
                </>
              ) : slugStatus === 'taken' ? (
                <>
                  <span className="text-amber-500">&#8226;</span>
                  <span className="text-gray-400">{slugPreview}</span>
                  <span className="text-amber-500">(name already taken)</span>
                </>
              ) : null}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
            <input type="time" required value={time} onChange={e => setTime(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End date <span className="font-normal text-gray-400">(optional)</span></label>
            <input type="date" min={date || undefined} value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End time <span className="font-normal text-gray-400">(optional)</span></label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
          <input value={venue} onChange={e => setVenue(e.target.value)} className={inputClass} placeholder="e.g. Club Aria, Accra" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link <span className="font-normal text-gray-400">(optional)</span></label>
          <input value={mapsLink} onChange={e => setMapsLink(e.target.value)} className={inputClass} placeholder="https://maps.google.com/..." />
          <p className="text-xs text-gray-400 mt-1">Without a link, attendees will see the venue name but won&apos;t get exact directions.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            className={`${inputClass} min-h-[100px] resize-y`}
            placeholder="Tell attendees what to expect…"
          />
        </div>
      </div>

      {/* Image upload */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-3">
        <h2 className="font-semibold text-gray-900">Event image</h2>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Event" className="aspect-[9/16] w-full max-w-[220px] rounded-xl object-cover" />
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={imageUploading}
          className="text-sm font-medium text-[#3d3d3d] border border-[#3d3d3d] rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 self-start"
        >
          {imageUploading ? 'Uploading…' : imageUrl ? 'Change image' : 'Upload image'}
        </button>
        <p className="text-xs text-gray-400">
          Recommended size: <strong className="font-medium text-gray-500">1080 × 1920 px (9:16)</strong>. Other sizes are accepted but will be cropped to fit on event cards. Max 5 MB.
        </p>
      </div>

      {/* Preview media */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
        <div>
          <h2 className="font-semibold text-gray-900">Preview media</h2>
          <p className="text-xs text-gray-400 mt-1">Show attendees what to expect — photos from past events and YouTube links.</p>
        </div>

        {/* Preview image thumbnails */}
        {previewImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {previewImages.map((url, i) => (
              <div key={i} className="relative group w-28 h-20 rounded-lg overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreviewImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity leading-none"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div>
          <input
            ref={previewFileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handlePreviewImagesChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => previewFileRef.current?.click()}
            disabled={previewUploading}
            className="text-sm font-medium text-[#3d3d3d] border border-[#3d3d3d] rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors disabled:opacity-50 self-start"
          >
            {previewUploading ? 'Uploading…' : '+ Add photos'}
          </button>
        </div>

        {/* Video URLs */}
        {previewVideos.length > 0 && (
          <div className="flex flex-col gap-2">
            {previewVideos.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={e => updateVideoUrl(i, e.target.value)}
                  className={`${inputClass} flex-1`}
                  placeholder="https://youtube.com/watch?v=..."
                />
                <button
                  type="button"
                  onClick={() => removeVideoUrl(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none px-1"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addVideoUrl}
          className="text-sm text-[#3d3d3d] font-medium hover:underline self-start"
        >
          + Add YouTube link
        </button>
      </div>

      {/* Scanner PIN */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Scanner PIN</h2>
          <p className="text-xs text-gray-400 mt-1">
            Give this PIN to your bouncers. They go to{' '}
            <span className="font-medium text-gray-600">tikkitte.com/scan</span>{' '}
            to scan tickets at the door.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="tel"
            inputMode="numeric"
            maxLength={4}
            readOnly
            value={scannerPin}
            placeholder="—"
            className="w-24 text-center font-mono text-xl tracking-[0.3em] border border-gray-200 bg-gray-50 text-gray-900 rounded-lg px-3 py-2.5 outline-none placeholder:tracking-normal placeholder:text-base"
          />
          <button
            type="button"
            onClick={() => setScannerPin(String(Math.floor(1000 + Math.random() * 9000)))}
            className="text-sm font-medium text-[#3d3d3d] border border-[#3d3d3d] rounded-lg px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            {scannerPin ? 'Regenerate' : 'Generate PIN'}
          </button>
          {scannerPin && (
            <button
              type="button"
              onClick={() => setScannerPin('')}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Ticket types */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
        <h2 className="font-semibold text-gray-900">Ticket types</h2>
        {ticketRows.map((row, i) => (
          <div key={i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            <div className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  required
                  value={row.label}
                  onChange={e => updateTicketRow(i, 'label', e.target.value)}
                  className={inputClass}
                  placeholder="Label (e.g. General, VIP)"
                />
              </div>
              <div className="w-28">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.price}
                  onChange={e => updateTicketRow(i, 'price', e.target.value)}
                  className={inputClass}
                  placeholder="Price"
                />
              </div>
              <div className="w-28">
                <input
                  type="number"
                  min="1"
                  value={row.total_quantity}
                  onChange={e => updateTicketRow(i, 'total_quantity', e.target.value)}
                  className={inputClass}
                  placeholder="Qty (∞)"
                />
              </div>
              {ticketRows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTicketRow(i)}
                  className="text-gray-400 hover:text-red-500 transition-colors pt-2.5 text-lg leading-none"
                  aria-label={`Remove ${row.label || 'ticket type'}`}
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex gap-2 text-xs text-gray-400 mt-2 px-1">
              <span className="flex-1">Label</span>
              <span className="w-28">Price (GHS)</span>
              <span className="w-28">Capacity (blank = ∞)</span>
              {ticketRows.length > 1 && <span className="w-4" />}
            </div>

            <div className="mt-3">
              <button
                type="button"
                aria-expanded={row.showAdvanced}
                onClick={() => updateTicketRow(i, 'showAdvanced', !row.showAdvanced)}
                className="text-sm font-medium text-[#3d3d3d] hover:text-[#2a2a2a] transition-colors"
              >
                {row.showAdvanced ? '▾' : '▸'} More settings
              </button>
            </div>

            {row.showAdvanced && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min per order</label>
                  <input
                    type="number"
                    min="1"
                    value={row.min_per_order}
                    onChange={e => updateTicketRow(i, 'min_per_order', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max per order <span className="font-normal text-gray-400">(optional)</span></label>
                  <input
                    type="number"
                    min={row.min_per_order || '1'}
                    value={row.max_per_order}
                    onChange={e => updateTicketRow(i, 'max_per_order', e.target.value)}
                    className={inputClass}
                    placeholder="No limit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale starts <span className="font-normal text-gray-400">(optional)</span></label>
                  <input
                    type="date"
                    value={row.sale_start_date}
                    onChange={e => updateTicketRow(i, 'sale_start_date', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start time <span className="font-normal text-gray-400">(optional)</span></label>
                  <input
                    type="time"
                    value={row.sale_start_time}
                    onChange={e => updateTicketRow(i, 'sale_start_time', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sale ends <span className="font-normal text-gray-400">(optional)</span></label>
                  <input
                    type="date"
                    min={row.sale_start_date || undefined}
                    value={row.sale_end_date}
                    onChange={e => updateTicketRow(i, 'sale_end_date', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End time <span className="font-normal text-gray-400">(optional)</span></label>
                  <input
                    type="time"
                    value={row.sale_end_time}
                    onChange={e => updateTicketRow(i, 'sale_end_time', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addTicketRow}
          className="text-sm text-[#3d3d3d] font-medium hover:underline self-start"
        >
          + Add ticket type
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || imageUploading}
          className={`${isEdit ? 'bg-[#3d3d3d] hover:bg-[#2a2a2a]' : 'bg-gray-900 hover:bg-gray-800'} text-white font-semibold px-8 py-3 rounded-xl transition-colors disabled:opacity-60`}
        >
          {loading ? 'Saving…' : (isEdit ? 'Save changes' : 'Save as draft')}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-500 font-medium px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )

  if (!showPreview) return form

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_300px]">
      <div>{form}</div>
      <EventPreviewCard
        name={name}
        date={date}
        time={time}
        venue={venue}
        imageUrl={imageUrl}
        ticketRows={ticketRows}
      />
    </div>
  )
}
