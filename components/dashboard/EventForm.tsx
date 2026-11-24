'use client'

import { isCancelledForOrganizer } from '@/lib/event-cancellation'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Event, Ticket } from '@/lib/types'
import { FLOOR_PLAN_VENUES, getFloorPlanVenue, isPresetVenueValue } from '@/lib/floor-plan-venues'
import ScannerAccess from './ScannerAccess'
import PublishButton from '@/app/dashboard/events/[id]/PublishButton'
import CancelButton from '@/app/dashboard/events/[id]/CancelButton'

type TicketRow = {
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

type Props = {
  event?: Event
  tickets?: Ticket[]
  organizerId: string
  organizerApproved?: boolean
  showPreview?: boolean
}

const EDIT_SECTIONS = [
  ['details', 'Event details'],
  ['event-image', 'Event image'],
  ['preview-media', 'Preview media'],
  ['scanner', 'Scanner access'],
  ['tickets', 'Ticket types'],
  ['status', 'Event status'],
] as const

type EditSectionId = (typeof EDIT_SECTIONS)[number][0]

const TICKET_DESCRIPTION_MAX = 500

const emptyTicketRow: TicketRow = {
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

function saveErrorMessage(message: string) {
  if (message.includes('ERR_ORGANIZER_NOT_ACTIVE')) return 'Your account can’t manage events. Email admin@tikkitte.com.'
  if (message.includes('ERR_UNAUTHENTICATED')) return 'Your session has expired. Sign in and try again.'
  if (message.includes('ERR_ORGANIZER_NOT_APPROVED')) return 'Publishing unlocks once your account is approved.'
  if (message.includes('ERR_EVENT_NOT_FOUND_OR_FORBIDDEN')) return 'This event was not found or you no longer have permission to edit it.'
  if (message.includes('ERR_EVENT_CHANGED_REFRESH')) return 'This event changed in another tab. Refresh before saving again.'
  if (message.includes('ERR_TICKET_NOT_FOUND_OR_FORBIDDEN')) return 'A ticket type changed in another tab. Refresh before saving again.'
  if (message.includes('ERR_TICKET_REMOVAL_LOCKED')) return 'Saved ticket types cannot be removed after an event has been published. Refresh to restore the missing row.'
  if (message.includes('ERR_TICKET_HAS_HISTORY')) return 'A ticket type with issued tickets or related records cannot be removed.'
  if (message.includes('ERR_CAPACITY_BELOW_ISSUED')) return 'Capacity cannot be lower than the number of tickets already issued.'
  if (message.includes('ERR_INVALID_FLOOR_PLAN_VENUE')) return 'Choose a valid venue preset and try again.'
  if (message.includes('ERR_FLOOR_PLAN_VENUE_LOCKED')) return 'This event already has tables set up for another venue’s floor plan. Pick that venue or a custom venue.'
  if (message.includes('ERR_INVALID_TICKET_DESCRIPTION')) return `Ticket descriptions can be up to ${TICKET_DESCRIPTION_MAX} characters.`
  if (message.includes('ERR_INVALID_EVENT') || message.includes('ERR_INVALID_TICKET')) return 'Some event or ticket details are invalid. Review the form and try again.'
  if (message.includes('ERR_')) return 'The event could not be saved because its data is no longer valid. Refresh and try again.'
  return message
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

function LockIcon() {
  return (
    <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
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
  const priceLabel = ticketRows.length === 0
    ? 'No tickets yet'
    : lowestPrice > 0
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

export default function EventForm({ event, tickets, organizerId, showPreview = false, organizerApproved = true }: Props) {
  const router = useRouter()
  const isEdit = !!event
  const cancelledForOrganizer = event ? isCancelledForOrganizer(event) : false
  const fileRef = useRef<HTMLInputElement>(null)
  const allowNavigationRef = useRef(false)

  const [name, setName] = useState(event?.name ?? '')
  const [date, setDate] = useState(event?.date ?? '')
  const [time, setTime] = useState(event?.time ? event.time.slice(0, 5) : '')
  const [endDate, setEndDate] = useState(event?.end_date ?? '')
  const [endTime, setEndTime] = useState(event?.end_time ? event.end_time.slice(0, 5) : '')
  const [floorPlanVenue, setFloorPlanVenue] = useState<Event['floor_plan_venue']>(event?.floor_plan_venue ?? null)
  const presetVenue = getFloorPlanVenue(floorPlanVenue)
  const [venue, setVenue] = useState(getFloorPlanVenue(event?.floor_plan_venue)?.name ?? event?.venue ?? '')
  const [mapsLink, setMapsLink] = useState(getFloorPlanVenue(event?.floor_plan_venue)?.mapsLink ?? event?.maps_link ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [imageUrl, setImageUrl] = useState<string | null>(event?.image?.[0] ?? null)
  const [imageUploading, setImageUploading] = useState(false)
  const [ticketRows, setTicketRows] = useState<TicketRow[]>(
    tickets && tickets.length > 0
      ? tickets.map(t => ({
          id: t.id,
          label: t.label,
          description: t.description ?? '',
          price: String(t.price),
          total_quantity: t.total_quantity != null ? String(t.total_quantity) : '',
          purchased_quantity: t.purchased_quantity,
          min_per_order: String(t.min_per_order ?? 1),
          max_per_order: t.max_per_order != null ? String(t.max_per_order) : '',
          sale_start_date: t.sale_start_date ?? '',
          sale_start_time: t.sale_start_time ? t.sale_start_time.slice(0, 5) : '',
          sale_end_date: t.sale_end_date ?? '',
          sale_end_time: t.sale_end_time ? t.sale_end_time.slice(0, 5) : '',
          showAdvanced: false,
        }))
      : isEdit
        ? []
        : [{ ...emptyTicketRow }]
  )
  const [previewImages, setPreviewImages] = useState<string[]>(event?.preview_images ?? [])
  const [previewVideos, setPreviewVideos] = useState<string[]>(event?.preview_videos ?? [])
  const [previewUploading, setPreviewUploading] = useState(false)
  const previewFileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<EditSectionId>('details')

  const buildEventPayload = () => {
    const filteredPreviewVideos = previewVideos.map(v => v.trim()).filter(Boolean)
    return {
      name,
      date,
      time: time + ':00',
      end_date: endDate || null,
      end_time: endTime ? endTime + ':00' : null,
      venue: venue || null,
      maps_link: mapsLink || null,
      floor_plan_venue: floorPlanVenue,
      description: description || null,
      image: imageUrl ? [imageUrl] : event?.image ?? null,
      preview_images: previewImages.length > 0 ? previewImages : null,
      preview_videos: filteredPreviewVideos.length > 0 ? filteredPreviewVideos : null,
      scanner_pin: null,
    }
  }

  const buildTicketPayloads = () =>
    ticketRows.map(row => ({
      id: row.id ?? null,
      label: row.label.trim(),
      description: row.description.trim() || null,
      price: Number(row.price),
      total_quantity: row.total_quantity === '' ? null : Number(row.total_quantity),
      min_per_order: Number(row.min_per_order || '1'),
      max_per_order: row.max_per_order === '' ? null : Number(row.max_per_order),
      sale_start_date: row.sale_start_date || null,
      sale_start_time: row.sale_start_time ? row.sale_start_time + ':00' : null,
      sale_end_date: row.sale_end_date || null,
      sale_end_time: row.sale_end_time ? row.sale_end_time + ':00' : null,
    }))

  // Keep the submitted payload and save state in sync.
  const currentPayload = { event: buildEventPayload(), tickets: buildTicketPayloads() }
  const lastSavedSnapshotRef = useRef(currentPayload)
  const isDirty = JSON.stringify(currentPayload) !== JSON.stringify(lastSavedSnapshotRef.current)
  const saveDisabled = loading || imageUploading || previewUploading
  const saveButtonLabel = loading ? 'Saving…' : isEdit ? 'Save changes' : 'Save as draft'

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

  const canRemoveTicketRow = (row: TicketRow) => !row.id || event?.ever_published === false

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
      const price = Number(row.price)
      const totalQuantity = row.total_quantity === '' ? null : Number(row.total_quantity)
      const minPerOrder = parseInt(row.min_per_order || '1')
      const maxPerOrder = row.max_per_order ? parseInt(row.max_per_order) : null

      if (!row.label.trim() || !row.price) {
        setError('Each ticket type needs a label and price.')
        return false
      }
      if (row.description.trim().length > TICKET_DESCRIPTION_MAX) {
        setError(`${label} description can be up to ${TICKET_DESCRIPTION_MAX} characters.`)
        return false
      }
      if (!Number.isFinite(price) || price < 0) {
        setError(`${label} needs a valid price of 0 or more.`)
        return false
      }
      if (totalQuantity !== null && (!Number.isInteger(totalQuantity) || totalQuantity < 0)) {
        setError(`${label} capacity must be a whole number of 0 or more.`)
        return false
      }
      if (totalQuantity !== null && totalQuantity < row.purchased_quantity) {
        setError(`${label} capacity cannot be lower than the ${row.purchased_quantity} tickets already issued.`)
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

    if (!validateEventDateRange()) return
    if (!validateTicketRows()) return

    setLoading(true)
    const supabase = createClient()
    const payloadToSave = currentPayload

    try {
      const { data: savedEventId, error: saveError } = await supabase.rpc('save_event_with_tickets', {
        p_event_id: event?.id ?? null,
        p_event: payloadToSave.event,
        p_tickets: payloadToSave.tickets,
        p_original_ticket_ids: (tickets ?? []).map(ticket => ticket.id),
      })

      if (saveError || typeof savedEventId !== 'string') {
        setError(saveErrorMessage(saveError?.message ?? 'The event could not be saved.'))
        return
      }

      lastSavedSnapshotRef.current = payloadToSave
      router.push(`/dashboard/events/${savedEventId}`)
      router.refresh()
    } catch {
      setError('The event could not be saved. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
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
        // Slug taken, so append a short random suffix
        const suffix = Math.random().toString(36).slice(2, 6)
        setResolvedSlug(baseSlug + '-' + suffix)
        setSlugStatus('taken')
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [baseSlug, event])

  useEffect(() => {
    if (!isDirty) return
    const warnBeforeLeaving = (leaveEvent: BeforeUnloadEvent) => {
      if (allowNavigationRef.current) return
      leaveEvent.preventDefault()
    }
    const warnBeforeLinkNavigation = (clickEvent: MouseEvent) => {
      if (allowNavigationRef.current || clickEvent.defaultPrevented) return
      const target = clickEvent.target
      const anchor = target instanceof Element ? target.closest('a') : null
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const destination = new URL(anchor.href, window.location.href)
      if (destination.origin !== window.location.origin || destination.hash && destination.pathname === window.location.pathname) return
      if (!window.confirm('Discard your unsaved changes and leave this page?')) {
        clickEvent.preventDefault()
        clickEvent.stopPropagation()
        return
      }
      allowNavigationRef.current = true
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)
    document.addEventListener('click', warnBeforeLinkNavigation, true)
    return () => {
      window.removeEventListener('beforeunload', warnBeforeLeaving)
      document.removeEventListener('click', warnBeforeLinkNavigation, true)
    }
  }, [isDirty])

  useEffect(() => {
    if (!isEdit) return

    const visibleSections = cancelledForOrganizer
      ? EDIT_SECTIONS.filter(([id]) => id !== 'status')
      : EDIT_SECTIONS
    const firstSection = document.getElementById(visibleSections[0][0])
    const scrollRoot = firstSection?.closest('main')
    if (!(scrollRoot instanceof HTMLElement)) return

    let animationFrame = 0
    const updateActiveSection = () => {
      const rootRect = scrollRoot.getBoundingClientRect()
      const marker = rootRect.top + Math.min(180, rootRect.height * 0.26)
      let nextSection: EditSectionId = visibleSections[0][0]

      for (const [id] of visibleSections) {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= marker) nextSection = id
      }

      if (scrollRoot.scrollTop + scrollRoot.clientHeight >= scrollRoot.scrollHeight - 8) {
        nextSection = visibleSections[visibleSections.length - 1][0]
      }
      setActiveSection((current) => current === nextSection ? current : nextSection)
    }
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(animationFrame)
      animationFrame = window.requestAnimationFrame(updateActiveSection)
    }

    scheduleUpdate()
    scrollRoot.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.cancelAnimationFrame(animationFrame)
      scrollRoot.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [cancelledForOrganizer, isEdit])

  const slugPreview = resolvedSlug ? 'tikkitte.com/e/' + resolvedSlug : ''

  const inputClass = 'create-input w-full rounded-2xl border border-[#ded8c9] bg-[#fbfaf6] px-4 py-3 text-sm text-[#25251f] outline-none placeholder:text-[#9a978d] disabled:cursor-not-allowed disabled:bg-[#eeeae0] disabled:text-[#77746b]'

  const form = (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-24">
      {/* Basic info */}
      <div id="details" className="create-card flex scroll-mt-8 flex-col gap-4 p-6">
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
          <label htmlFor="floor-plan-venue" className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
          <select
            id="floor-plan-venue"
            value={floorPlanVenue ?? 'other'}
            onChange={(e) => {
              const preset = getFloorPlanVenue(e.target.value)
              if (preset) {
                setFloorPlanVenue(preset.key)
                setVenue(preset.name)
                setMapsLink(preset.mapsLink)
              } else {
                setFloorPlanVenue(null)
                if (isPresetVenueValue(venue)) setVenue('')
                if (isPresetVenueValue(mapsLink)) setMapsLink('')
              }
            }}
            className={inputClass}
          >
            {FLOOR_PLAN_VENUES.map((preset) => <option key={preset.key} value={preset.key}>{preset.name}</option>)}
            <option value="other">Custom venue</option>
          </select>
        </div>
        <div>
          <label htmlFor="venue-name" className="block text-sm font-medium text-gray-700 mb-1">Venue name</label>
          <div className="relative">
            <input id="venue-name" value={venue} onChange={e => setVenue(e.target.value)} disabled={!!presetVenue} className={inputClass} style={presetVenue ? { paddingRight: '3rem' } : undefined} placeholder="e.g. Club Aria, Accra" />
            {presetVenue && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#77746b]" title="Managed by the selected venue"><LockIcon /></span>}
          </div>
        </div>
        <div>
          <label htmlFor="maps-link" className="block text-sm font-medium text-gray-700 mb-1">Google Maps Link <span className="font-normal text-gray-400">(optional)</span></label>
          <div className="relative">
            <input id="maps-link" type="url" value={mapsLink} onChange={e => setMapsLink(e.target.value)} disabled={!!presetVenue} className={inputClass} style={presetVenue ? { paddingRight: '3rem' } : undefined} placeholder="https://maps.google.com/..." />
            {presetVenue && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#77746b]" title="Managed by the selected venue"><LockIcon /></span>}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {presetVenue
              ? `${presetVenue.name}’s verified venue details are used for this event.`
              : 'Without a link, attendees will see the venue name but won’t get exact directions.'}
          </p>
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
      <div id="event-image" className="create-card flex scroll-mt-8 flex-col gap-3 p-6">
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
      <div id="preview-media" className="create-card flex scroll-mt-8 flex-col gap-4 p-6">
        <div>
          <h2 className="font-semibold text-gray-900">Preview media</h2>
          <p className="text-xs text-gray-400 mt-1">Show attendees what to expect: photos from past events and YouTube links.</p>
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

      <div id="scanner" className="create-card scroll-mt-8 p-6">
        {!organizerApproved ? <p className="text-sm text-gray-500">Scanner access unlocks once your account is approved.</p> : event?.id ? <ScannerAccess key={event.id} eventId={event.id} /> : <p className="text-sm text-gray-500">Save your event first, then generate a scanner code from its dashboard.</p>}
      </div>

      {/* Ticket types */}
      <div id="tickets" className="create-card flex scroll-mt-8 flex-col gap-4 p-6">
        <div>
          <h2 className="font-semibold text-gray-900">Ticket types</h2>
          {event?.ever_published && (
            <p className="text-xs text-gray-500 mt-1">
              Saved ticket types cannot be removed because this event has been published. You can still edit their details and sale windows.
            </p>
          )}
        </div>
        {ticketRows.map((row, i) => (
          <div key={row.id ?? i} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
            {/* Phones: the name gets its own row, price and capacity share the next. */}
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_7rem_auto]">
              <label className="col-span-2 min-w-0 sm:col-span-1">
                <span className="mb-1 block text-xs text-gray-500">Name</span>
                <input
                  required
                  value={row.label}
                  onChange={e => updateTicketRow(i, 'label', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. General, VIP"
                />
              </label>
              <label className="min-w-0">
                <span className="mb-1 block text-xs text-gray-500">Price (GHS)</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.price}
                  onChange={e => updateTicketRow(i, 'price', e.target.value)}
                  className={inputClass}
                  placeholder="0"
                />
              </label>
              <label className="min-w-0">
                <span className="mb-1 block text-xs text-gray-500">Capacity</span>
                <input
                  type="number"
                  min="0"
                  value={row.total_quantity}
                  onChange={e => updateTicketRow(i, 'total_quantity', e.target.value)}
                  className={inputClass}
                  placeholder="Unlimited"
                />
              </label>
              <div className="col-start-3 row-start-1 flex items-end sm:col-start-4">
                {canRemoveTicketRow(row) ? (
                  <button
                    type="button"
                    onClick={() => removeTicketRow(i)}
                    className="flex h-11 w-8 items-center justify-center text-lg leading-none text-gray-400 transition-colors hover:text-red-500"
                    aria-label={`Remove ${row.label || 'ticket type'}`}
                  >
                    ×
                  </button>
                ) : (
                  <span title="Saved ticket types cannot be removed after an event has been published.">
                    <button
                      type="button"
                      disabled
                      className="flex h-11 w-8 cursor-not-allowed items-center justify-center text-lg leading-none text-gray-300"
                      aria-label={`${row.label || 'Ticket type'} cannot be removed`}
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3">
              <label htmlFor={`ticket-description-${i}`} className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                id={`ticket-description-${i}`}
                rows={2}
                maxLength={TICKET_DESCRIPTION_MAX}
                value={row.description}
                onChange={e => updateTicketRow(i, 'description', e.target.value)}
                className={`${inputClass} resize-y`}
                placeholder="What this ticket includes, e.g. entry before 11pm and one free drink"
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {row.description.length}/{TICKET_DESCRIPTION_MAX}
              </p>
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

      {isEdit && !cancelledForOrganizer && (
        <section id="status" className="create-card scroll-mt-8 p-6" aria-labelledby="status-title">
          {/* What publishing and cancelling mean is explained in their confirm dialogs. */}
          <div className="flex items-center justify-between gap-3">
            <h2 id="status-title" className="font-semibold text-[#25251f]">Status</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${event.published ? 'bg-green-50 text-green-700' : 'bg-purple-50 text-purple-700'}`}>{event.published ? 'Live' : 'Draft'}</span>
          </div>
          <p className="mt-1 text-sm text-[#77746b]">{event.published ? 'Your event page is public.' : 'Not public yet.'}</p>
          {isDirty && <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">Save or discard your changes first.</p>}
          <fieldset disabled={isDirty} className="mt-4 disabled:opacity-50">
            <PublishButton eventId={event.id} published={event.published} approved={organizerApproved} />
            <div className="mt-5 border-t border-[var(--tikkitte-cream-border)] pt-2">
              <CancelButton eventId={event.id} />
            </div>
          </fieldset>
        </section>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className={isEdit ? 'sticky bottom-3 z-20 flex items-center gap-3 rounded-[22px] border border-[#d8d2c4] bg-white/95 p-2 shadow-[0_8px_28px_rgba(38,37,31,0.12)] backdrop-blur sm:p-3' : 'flex gap-3'}>
        {isEdit && (
          <p className="hidden pl-2 text-sm font-medium text-[#6d6a60] sm:block" role="status">
            {isDirty ? 'You have unsaved changes' : 'All changes saved'}
          </p>
        )}
        {/* On phones the two buttons fill the bar; on wider screens they sit on the right. */}
        <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
          <button
            type="button"
            onClick={() => {
              if (isEdit && isDirty) {
                allowNavigationRef.current = true
                window.location.reload()
              }
              else router.back()
            }}
            className="create-focus flex-1 rounded-full border border-[#d8d2c4] px-5 py-3 font-medium text-[#666359] transition-colors hover:bg-[#eeeae0] sm:flex-none"
          >
            {isEdit && isDirty ? 'Discard' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={saveDisabled || (isEdit && !isDirty)}
            className="create-focus flex-[2] rounded-full bg-[#2766d2] px-7 py-3 font-semibold text-white transition-colors hover:bg-[#1f56b5] disabled:opacity-50 sm:flex-none"
          >
            {saveButtonLabel}
          </button>
        </div>
      </div>
    </form>
  )

  if (!showPreview && isEdit) {
    const sections = cancelledForOrganizer ? EDIT_SECTIONS.filter(([id]) => id !== 'status') : EDIT_SECTIONS
    return (
      // grid-cols-1 keeps the phone column at screen width; an implicit grid
      // column grows to fit its content and pushed the cards off the screen.
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav className="sticky top-8 hidden rounded-[22px] border border-[#ded8c9] bg-white p-3 lg:block" aria-label="Event form sections">
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`} aria-current={activeSection === id ? 'location' : undefined} className={`create-focus block rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${activeSection === id ? 'bg-[#e4ecfb] text-[#245dbc]' : 'text-[#666359] hover:bg-[#eeeae0] hover:text-[#25251f]'}`}>
              {label}
            </a>
          ))}
        </nav>
        {form}
      </div>
    )
  }

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
