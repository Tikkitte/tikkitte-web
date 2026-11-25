'use client'

import { isCancelledForOrganizer } from '@/lib/event-cancellation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Badge, Button, Eyebrow } from 'tikkitte-ui'
import type { Event, Ticket } from '@/lib/types'
import { FLOOR_PLAN_VENUES, getFloorPlanVenue, isPresetVenueValue } from '@/lib/floor-plan-venues'
import { extractYouTubeId } from '@/lib/youtube'
import PublishButton from '@/app/dashboard/events/[id]/PublishButton'
import CancelButton from '@/app/dashboard/events/[id]/CancelButton'
import EventImageSection, { IMAGE_TYPES } from './event-form/EventImageSection'
import PreviewMediaSection from './event-form/PreviewMediaSection'
import ScannerSection from './event-form/ScannerSection'
import TicketTypeCard, { TICKET_DESCRIPTION_MAX, emptyTicketRow, type TicketRow } from './event-form/TicketTypeCard'
import {
  ACCENTS, ArrowLeftIcon, CalendarIcon, CheckCircleIcon, ChevronDownIcon, DocumentIcon, GlobeIcon, ImageIcon, InfoIcon,
  Label, LinkIcon, LockIcon, Note, PinIcon, PlusIcon, Section, TicketIcon, VerifiedIcon,
  dashedButtonClass, fieldClass, lockedFieldClass, textareaClass,
} from './event-form/ui'

type Props = {
  event: Event
  tickets: Ticket[]
  organizerId: string
  organizerApproved: boolean
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

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

// "Wed 16 Dec", or "Wed 16 Dec, 10:00 PM" with a time. Dates are Accra (UTC) wall-clock values.
function formatEventDate(date: string, time?: string) {
  if (!date) return 'Date not set'
  const [y, m, d] = date.split('-').map(Number)
  const day = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
  if (!time) return day
  const [hh, mm] = time.split(':').map(Number)
  return `${day}, ${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`
}

function toTicketRow(t: Ticket): TicketRow {
  return {
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
  }
}

async function uploadEventImage(organizerId: string, file: File) {
  const supabase = createClient()
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${organizerId}/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('event-images').upload(path, file, { contentType: file.type, upsert: true })
  if (error) throw error
  return supabase.storage.from('event-images').getPublicUrl(path).data.publicUrl
}

function imageFileError(file: File) {
  if (!IMAGE_TYPES.includes(file.type)) return 'Only JPEG, PNG, WebP, and GIF images are allowed.'
  if (file.size > MAX_IMAGE_BYTES) return 'Images must be under 5 MB.'
  return null
}

export default function EventForm({ event, tickets, organizerId, organizerApproved }: Props) {
  const router = useRouter()
  const cancelledForOrganizer = isCancelledForOrganizer(event)
  const allowNavigationRef = useRef(false)

  const [name, setName] = useState(event.name)
  const [date, setDate] = useState(event.date)
  const [time, setTime] = useState(event.time ? event.time.slice(0, 5) : '')
  const [endDate, setEndDate] = useState(event.end_date ?? '')
  const [endTime, setEndTime] = useState(event.end_time ? event.end_time.slice(0, 5) : '')
  const [floorPlanVenue, setFloorPlanVenue] = useState<Event['floor_plan_venue']>(event.floor_plan_venue ?? null)
  const presetVenue = getFloorPlanVenue(floorPlanVenue)
  const [venue, setVenue] = useState(getFloorPlanVenue(event.floor_plan_venue)?.name ?? event.venue ?? '')
  const [mapsLink, setMapsLink] = useState(getFloorPlanVenue(event.floor_plan_venue)?.mapsLink ?? event.maps_link ?? '')
  const [description, setDescription] = useState(event.description ?? '')
  const [imageUrl, setImageUrl] = useState<string | null>(event.image?.[0] ?? null)
  const [imageUploading, setImageUploading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [ticketRows, setTicketRows] = useState<TicketRow[]>(() => tickets.map(toTicketRow))
  const [previewImages, setPreviewImages] = useState<string[]>(event.preview_images ?? [])
  const [previewVideos, setPreviewVideos] = useState<string[]>(event.preview_videos ?? [])
  const [newVideo, setNewVideo] = useState('')
  const [previewUploading, setPreviewUploading] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const buildEventPayload = () => {
    const videos = [...previewVideos, newVideo].map(v => v.trim()).filter(Boolean)
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
      image: imageUrl ? [imageUrl] : event.image ?? null,
      preview_images: previewImages.length > 0 ? previewImages : null,
      preview_videos: videos.length > 0 ? videos : null,
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

  const uploadPoster = async (file: File) => {
    const problem = imageFileError(file)
    setImageError(problem)
    if (problem) return
    setImageUploading(true)
    try {
      setImageUrl(await uploadEventImage(organizerId, file))
    } catch (uploadError) {
      setImageError('Image upload failed: ' + (uploadError instanceof Error ? uploadError.message : 'try again.'))
    } finally {
      setImageUploading(false)
    }
  }

  const addPreviewImages = async (files: File[]) => {
    if (files.length === 0) return
    const problem = files.map(imageFileError).find(Boolean) ?? null
    setMediaError(problem)
    if (problem) return
    setPreviewUploading(true)
    try {
      const uploaded: string[] = []
      for (const file of files) uploaded.push(await uploadEventImage(organizerId, file))
      setPreviewImages(prev => [...prev, ...uploaded])
    } catch (uploadError) {
      setMediaError('Upload failed: ' + (uploadError instanceof Error ? uploadError.message : 'try again.'))
    } finally {
      setPreviewUploading(false)
    }
  }

  const addTicketRow = () => setTicketRows(r => [...r, { ...emptyTicketRow }])
  const removeTicketRow = (i: number) => setTicketRows(r => r.filter((_, idx) => idx !== i))
  const canRemoveTicketRow = (row: TicketRow) => !row.id || event.ever_published === false
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

  // Includes text left in the add field, which is saved too.
  const validateVideoLinks = () => {
    const links = [...previewVideos, newVideo].map(v => v.trim()).filter(Boolean)
    if (links.every(link => extractYouTubeId(link))) return true
    setError('One of your YouTube links isn’t a video link. Fix or remove it, then save.')
    return false
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
    if (!validateVideoLinks()) return
    if (!validateTicketRows()) return

    setLoading(true)
    const supabase = createClient()
    const payloadToSave = currentPayload

    try {
      const { data: savedEventId, error: saveError } = await supabase.rpc('save_event_with_tickets', {
        p_event_id: event.id,
        p_event: payloadToSave.event,
        p_tickets: payloadToSave.tickets,
        p_original_ticket_ids: tickets.map(ticket => ticket.id),
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

  const savedVenue = getFloorPlanVenue(event.floor_plan_venue)?.name ?? event.venue
  const ticketCount = ticketRows.length

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-[840px] flex-col gap-4 sm:gap-6">
      <header className="flex flex-col gap-4 py-2 sm:gap-5 sm:pb-4 sm:pt-3">
        <Link href="/dashboard/events" className="create-focus inline-flex items-center gap-1.5 self-start text-sm font-medium text-[var(--tikkitte-ink-soft)] hover:text-[var(--tikkitte-ink)]">
          <ArrowLeftIcon />Events
        </Link>
        <div className="grid grid-cols-[66px_minmax(0,1fr)] items-end gap-x-3.5 gap-y-4 sm:grid-cols-[96px_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-3">
          <div className="flex h-[88px] w-[66px] items-center justify-center overflow-hidden rounded-xl bg-[#ebe7dc] text-[var(--tikkitte-ink-faint)] shadow-[0_8px_24px_rgba(25,25,23,0.14)] sm:row-span-2 sm:h-32 sm:w-24">
            {/* eslint-disable-next-line @next/next/no-img-element -- shows a just-uploaded poster without the optimizer */}
            {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon />}
          </div>
          <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
            <Eyebrow>Edit event</Eyebrow>
            <h1 className="create-display break-words text-[34px] leading-[0.98] tracking-[-0.005em] sm:text-6xl">{event.name}</h1>
          </div>
          <div className="col-span-2 flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[13.5px] text-[var(--tikkitte-ink-soft)] sm:col-span-1 sm:col-start-2 sm:gap-x-[18px] sm:text-[14.5px]">
            <Badge dot={event.published && !cancelledForOrganizer}>{cancelledForOrganizer ? 'Cancelled' : event.published ? 'Live' : 'Draft'}</Badge>
            <span className="inline-flex items-center gap-1.5"><CalendarIcon />{formatEventDate(event.date, event.time)}</span>
            {savedVenue && <span className="inline-flex min-w-0 items-center gap-1.5"><PinIcon /><span className="truncate">{savedVenue}</span></span>}
          </div>
        </div>
      </header>

      <Section id="details" title="Event details" icon={<DocumentIcon />} accent={ACCENTS.details}>
        <div className="flex flex-col gap-[18px] sm:gap-[22px]">
          <div>
            <Label htmlFor="event-name" required>Event name</Label>
            <input id="event-name" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Saturday Night Lights" className={fieldClass} />
            {event.slug && (
              <p className="mt-2 flex min-w-0 items-center gap-1.5 text-[13.5px] text-[var(--tikkitte-ink-soft)]">
                <LinkIcon /><span className="truncate">tikkitte.com/e/{event.slug}</span>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="min-w-0">
              <Label htmlFor="start-date" required>Start date</Label>
              <input id="start-date" type="date" required value={date} onChange={e => setDate(e.target.value)} className={fieldClass} />
            </div>
            <div className="min-w-0">
              <Label htmlFor="start-time" required>Start time</Label>
              <input id="start-time" type="time" required value={time} onChange={e => setTime(e.target.value)} className={fieldClass} />
            </div>
            <div className="min-w-0">
              <Label htmlFor="end-date">End date</Label>
              <input id="end-date" type="date" min={date || undefined} value={endDate} onChange={e => setEndDate(e.target.value)} className={fieldClass} />
            </div>
            <div className="min-w-0">
              <Label htmlFor="end-time">End time</Label>
              <input id="end-time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={fieldClass} />
            </div>
          </div>
          <div>
            <Label htmlFor="floor-plan-venue">Venue</Label>
            <div className="relative">
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
                className={`${fieldClass} appearance-none pr-11`}
              >
                {FLOOR_PLAN_VENUES.map((preset) => <option key={preset.key} value={preset.key}>{preset.name}</option>)}
                <option value="other">Custom venue</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[var(--tikkitte-ink-soft)]"><ChevronDownIcon /></span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 sm:gap-4">
              {([
                ['venue-name', 'Venue name', venue, setVenue, 'e.g. Club Aria, Accra', 'text'],
                ['maps-link', 'Google Maps link', mapsLink, setMapsLink, 'Paste a Google Maps link', 'url'],
              ] as const).map(([id, label, value, setValue, placeholder, type]) => (
                <div key={id} className="min-w-0">
                  <Label htmlFor={id}>{label}</Label>
                  <div className="relative">
                    <input
                      id={id}
                      type={type}
                      value={value}
                      onChange={e => setValue(e.target.value)}
                      readOnly={!!presetVenue}
                      aria-readonly={!!presetVenue || undefined}
                      placeholder={placeholder}
                      className={presetVenue ? lockedFieldClass : fieldClass}
                    />
                    {presetVenue && <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[var(--tikkitte-ink-soft)]" title="Managed by the selected venue"><LockIcon /></span>}
                  </div>
                </div>
              ))}
            </div>
            {presetVenue
              ? <Note icon={<span className="text-[var(--tikkitte-blue)]"><VerifiedIcon /></span>}>{presetVenue.name}’s verified venue details are used for this event.</Note>
              : !mapsLink.trim() && <Note icon={<PinIcon size={16} />} tone="warn">Without a link, attendees will see the venue name but won’t get exact directions.</Note>}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell attendees what to expect" className={`${textareaClass} h-[110px]`} />
          </div>
        </div>
      </Section>

      <div className="flex flex-col gap-2">
        <EventImageSection imageUrl={imageUrl} uploading={imageUploading} onFile={uploadPoster} />
        {imageError && <p role="alert" className="px-1 text-sm text-[#b42318]">{imageError}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <PreviewMediaSection
          images={previewImages}
          uploading={previewUploading}
          onAddImages={addPreviewImages}
          onRemoveImage={(i) => setPreviewImages(prev => prev.filter((_, idx) => idx !== i))}
          videos={previewVideos}
          onVideosChange={setPreviewVideos}
          newVideo={newVideo}
          onNewVideoChange={setNewVideo}
        />
        {mediaError && <p role="alert" className="px-1 text-sm text-[#b42318]">{mediaError}</p>}
      </div>

      <ScannerSection eventId={event.id} approved={organizerApproved} />

      <Section
        id="tickets"
        title="Ticket types"
        icon={<TicketIcon />}
        accent={ACCENTS.tickets}
        aside={<span className="whitespace-nowrap text-[13px] text-[var(--tikkitte-ink-soft)]">{ticketCount} {ticketCount === 1 ? 'type' : 'types'}</span>}
      >
        <div className="flex flex-col gap-3.5">
          {ticketRows.map((row, i) => (
            <TicketTypeCard
              key={row.id ?? `new-${i}`}
              row={row}
              index={i}
              canRemove={canRemoveTicketRow(row)}
              onChange={(field, value) => updateTicketRow(i, field, value)}
              onRemove={() => removeTicketRow(i)}
            />
          ))}
          <button type="button" onClick={addTicketRow} className={`${dashedButtonClass} flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[15px]`}>
            <span style={{ color: ACCENTS.tickets.color }}><PlusIcon size={18} /></span>Add ticket type
          </button>
        </div>
      </Section>

      {!cancelledForOrganizer && (
        <Section id="status" title="Event status" icon={<GlobeIcon />} accent={ACCENTS.status}>
          {/* What publishing and cancelling mean is explained in their confirm dialogs. */}
          <fieldset disabled={isDirty} className="min-w-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <Badge dot={event.published}>{event.published ? 'Live' : 'Draft'}</Badge>
                <span className="text-[15px] text-[var(--tikkitte-ink)]">{event.published ? 'Your event page is public.' : 'Not public yet.'}</span>
              </div>
              <div className="flex flex-col-reverse gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                <CancelButton eventId={event.id} />
                <PublishButton eventId={event.id} published={event.published} approved={organizerApproved} variant="status" />
              </div>
            </div>
            {isDirty
              ? <Note icon={<InfoIcon />} tone="warn" className="mt-3.5 sm:justify-end">Save or discard your changes first.</Note>
              : !event.published && !organizerApproved && <Note icon={<LockIcon />} className="mt-3.5 sm:justify-end">Publishing unlocks once you’re approved.</Note>}
          </fieldset>
        </Section>
      )}

      {error && <p role="alert" className="px-1 text-sm text-[#b42318]">{error}</p>}

      <div className="sticky bottom-3 z-20 sm:bottom-6">
        <div className="flex flex-col gap-2.5 rounded-[22px] border border-[var(--tikkitte-cream-border)] bg-white p-3 shadow-[0_18px_50px_rgba(25,25,23,0.16)] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pl-6">
          <p role="status" className="flex items-center gap-2 px-1.5 pt-0.5 text-sm sm:p-0">
            {isDirty
              ? <><span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-[#d98a1c]" /><span className="font-bold text-[var(--tikkitte-ink)]">You have unsaved changes</span></>
              : <><span className="text-[#1f7a5c]"><CheckCircleIcon /></span><span className="text-[var(--tikkitte-ink-soft)]">All changes saved</span></>}
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:flex">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (isDirty) {
                  allowNavigationRef.current = true
                  window.location.reload()
                } else router.back()
              }}
            >
              {isDirty ? 'Discard' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" disabled={saveDisabled || !isDirty}>{loading ? 'Saving…' : 'Save changes'}</Button>
          </div>
        </div>
      </div>
    </form>
  )
}
