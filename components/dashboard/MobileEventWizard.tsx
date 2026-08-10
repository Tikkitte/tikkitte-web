'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type TicketDraft = {
  label: string
  price: string
  capacity: string
}

const ARIA_MAPS_LINK = 'https://maps.app.goo.gl/vUpGGgAAwqAgAEkP9?g_st=ipc'
const blankTicket: TicketDraft = { label: 'General admission', price: '', capacity: '' }
const fieldClass = 'create-input min-h-14 w-full rounded-[18px] border border-[#ded8c9] bg-white px-4 text-base text-[#25251f] outline-none placeholder:text-[#9a978d]'

function ArrowLeft() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
}

function validateImage(file: File) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowed.includes(file.type)) return 'Choose a JPEG, PNG, WebP, or GIF image.'
  if (file.size > 5 * 1024 * 1024) return 'The event image must be under 5 MB.'
  return null
}

export default function MobileEventWizard({ organizerId }: { organizerId: string }) {
  const router = useRouter()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [venueType, setVenueType] = useState<'aria' | 'other'>('aria')
  const [venue, setVenue] = useState('')
  const [mapsLink, setMapsLink] = useState('')
  const [tickets, setTickets] = useState<TicketDraft[]>([{ ...blankTicket }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateTicket = (index: number, patch: Partial<TicketDraft>) => {
    setTickets((rows) => rows.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row))
  }

  const moveForward = () => {
    setError(null)
    if (step === 1) {
      if (!name.trim() || !date || !time) {
        setError('Add an event name, date, and start time to continue.')
        return
      }
      setStep(2)
      return
    }
    if (venueType === 'other' && !venue.trim()) {
      setError('Add the venue name to continue.')
      return
    }
    setStep(3)
  }

  const saveDraft = async () => {
    setError(null)
    for (const ticket of tickets) {
      if (!ticket.label.trim() || ticket.price === '' || Number(ticket.price) < 0) {
        setError('Each ticket needs a name and a valid price of 0 or more.')
        return
      }
      if (ticket.capacity && (!Number.isInteger(Number(ticket.capacity)) || Number(ticket.capacity) < 1)) {
        setError('Ticket capacity must be a whole number greater than zero.')
        return
      }
    }

    setSaving(true)
    const supabase = createClient()
    let imageUrl: string | null = null

    try {
      if (image) {
        const extension = {
          'image/jpeg': 'jpg',
          'image/png': 'png',
          'image/webp': 'webp',
          'image/gif': 'gif',
        }[image.type] ?? 'jpg'
        const path = `${organizerId}/${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage
          .from('event-images')
          .upload(path, image, { contentType: image.type, upsert: false })
        if (uploadError) throw new Error('The image could not be uploaded. Try again.')
        imageUrl = supabase.storage.from('event-images').getPublicUrl(path).data.publicUrl
      }

      const eventPayload = {
        name: name.trim(),
        date,
        time: `${time}:00`,
        end_date: null,
        end_time: null,
        venue: venueType === 'aria' ? 'Aria' : venue.trim(),
        maps_link: venueType === 'aria' ? ARIA_MAPS_LINK : mapsLink.trim() || null,
        floor_plan_venue: venueType === 'aria' ? 'aria' : null,
        description: description.trim() || null,
        image: imageUrl ? [imageUrl] : null,
        preview_images: null,
        preview_videos: null,
        scanner_pin: null,
      }
      const ticketPayload = tickets.map((ticket) => ({
        id: null,
        label: ticket.label.trim(),
        price: Number(ticket.price),
        total_quantity: ticket.capacity ? Number(ticket.capacity) : null,
        min_per_order: 1,
        max_per_order: null,
        sale_start_date: null,
        sale_start_time: null,
        sale_end_date: null,
        sale_end_time: null,
      }))

      const { data: eventId, error: saveError } = await supabase.rpc('save_event_with_tickets', {
        p_event_id: null,
        p_event: eventPayload,
        p_tickets: ticketPayload,
        p_original_ticket_ids: [],
      })
      if (saveError || typeof eventId !== 'string') {
        throw new Error(saveError?.message.includes('ERR_') ? 'The draft could not be saved. Review the details and try again.' : saveError?.message || 'The draft could not be saved.')
      }

      router.push(`/dashboard/events/${eventId}/edit`)
      router.refresh()
    } catch (saveFailure) {
      setError(saveFailure instanceof Error ? saveFailure.message : 'The draft could not be saved. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="-mx-4 -my-6 min-h-dvh bg-[#f5f1e7] px-5 pb-8 pt-[max(20px,env(safe-area-inset-top))] md:-mx-8 md:-my-8 md:min-h-full md:px-8 md:py-8 lg:-mx-10 lg:px-10">
      <header className="mx-auto flex max-w-2xl items-center justify-between">
        {step === 1 ? (
          <Link href="/dashboard/events" className="create-focus flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#25251f]" aria-label="Close event creation">×</Link>
        ) : (
          <button type="button" onClick={() => { setError(null); setStep((value) => value - 1) }} className="create-focus flex h-11 w-11 items-center justify-center rounded-full bg-white" aria-label="Previous step"><ArrowLeft /></button>
        )}
        <p className="text-sm font-semibold text-[#666359]">Step {step} of 3</p>
        <span className="w-11" />
      </header>

      <div className="mx-auto mt-5 flex max-w-2xl gap-2" aria-hidden="true">
        {[1, 2, 3].map((item) => <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-[#2766d2]' : 'bg-[#dcd6c7]'}`} />)}
      </div>

      <main className="mx-auto mt-9 max-w-md md:max-w-xl">
        {step === 1 && (
          <section aria-labelledby="wizard-heading">
            <p className="text-sm font-semibold text-[#2766d2]">The essentials</p>
            <h1 id="wizard-heading" className="create-display mt-2 text-5xl leading-[0.98] text-[#25251f]">What are you planning?</h1>
            <div className="mt-8 space-y-4">
              <label className="block"><span className="mb-2 block text-sm font-semibold">Event name</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} placeholder="e.g. Saturday Night Lights" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label><span className="mb-2 block text-sm font-semibold">Date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass} /></label>
                <label><span className="mb-2 block text-sm font-semibold">Starts</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} className={fieldClass} /></label>
              </div>
              <label className="block"><span className="mb-2 block text-sm font-semibold">Description <span className="font-normal text-[#89867c]">(optional)</span></span><textarea value={description} onChange={(event) => setDescription(event.target.value)} className={`${fieldClass} min-h-28 py-4`} placeholder="Tell people what to expect…" /></label>
              <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const validationError = validateImage(file)
                if (validationError) { setError(validationError); return }
                setImage(file)
                setImagePreview(URL.createObjectURL(file))
              }} />
              <button type="button" onClick={() => imageInputRef.current?.click()} className="create-focus flex min-h-20 w-full items-center gap-4 rounded-[20px] border border-dashed border-[#c9c1ae] bg-white px-4 text-left">
                {imagePreview ? (
                  // A local blob preview is not compatible with next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Event preview" className="h-14 w-14 rounded-xl object-cover" />
                ) : <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e9eef8] text-xl text-[#2766d2]">＋</span>}
                <span><strong className="block text-sm">{image ? 'Change event image' : 'Add an event image'}</strong><span className="text-xs text-[#89867c]">Portrait images look best</span></span>
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section aria-labelledby="wizard-heading">
            <p className="text-sm font-semibold text-[#2766d2]">Set the scene</p>
            <h1 id="wizard-heading" className="create-display mt-2 text-5xl leading-[0.98] text-[#25251f]">Where is it happening?</h1>
            <div className="mt-8 space-y-3" role="radiogroup" aria-label="Venue type">
              <button type="button" role="radio" aria-checked={venueType === 'aria'} onClick={() => setVenueType('aria')} className={`create-focus w-full rounded-[22px] border p-5 text-left ${venueType === 'aria' ? 'border-[#2766d2] bg-[#eaf0fb]' : 'border-[#ded8c9] bg-white'}`}>
                <span className="flex items-center justify-between"><strong>Aria</strong><span className="rounded-full bg-[#d2e1fb] px-3 py-1 text-xs font-semibold text-[#2766d2]">Verified venue</span></span>
                <span className="mt-2 block text-sm leading-6 text-[#77746b]">Includes Aria’s verified location and interactive table plan.</span>
              </button>
              <button type="button" role="radio" aria-checked={venueType === 'other'} onClick={() => setVenueType('other')} className={`create-focus w-full rounded-[22px] border p-5 text-left ${venueType === 'other' ? 'border-[#2766d2] bg-[#eaf0fb]' : 'border-[#ded8c9] bg-white'}`}>
                <strong>Another venue</strong>
                <span className="mt-2 block text-sm text-[#77746b]">Enter a custom place and optional Maps link.</span>
              </button>
            </div>
            {venueType === 'other' && <div className="mt-5 space-y-4"><input value={venue} onChange={(event) => setVenue(event.target.value)} className={fieldClass} placeholder="Venue name" /><input type="url" value={mapsLink} onChange={(event) => setMapsLink(event.target.value)} className={fieldClass} placeholder="Google Maps link (optional)" /></div>}
          </section>
        )}

        {step === 3 && (
          <section aria-labelledby="wizard-heading">
            <p className="text-sm font-semibold text-[#2766d2]">Open the doors</p>
            <h1 id="wizard-heading" className="create-display mt-2 text-5xl leading-[0.98] text-[#25251f]">Add your tickets.</h1>
            <p className="mt-4 text-sm leading-6 text-[#77746b]">
              This saves your event as a draft. <strong className="font-bold text-[#25251f]">You can fine-tune everything before publishing</strong>—including sale windows, order limits, preview media, scanner settings, and table packages.
            </p>
            <div className="mt-7 space-y-4">
              {tickets.map((ticket, index) => (
                <div key={index} className="rounded-[22px] border border-[#ded8c9] bg-white p-4">
                  <div className="flex items-center justify-between"><strong className="text-sm">Ticket {index + 1}</strong>{tickets.length > 1 && <button type="button" onClick={() => setTickets((rows) => rows.filter((_, item) => item !== index))} className="create-focus min-h-11 px-2 text-sm text-red-600">Remove</button>}</div>
                  <div className="mt-3 space-y-3"><input value={ticket.label} onChange={(event) => updateTicket(index, { label: event.target.value })} className={fieldClass} placeholder="Ticket name" /><div className="grid grid-cols-2 gap-3"><input type="number" min="0" step="0.01" value={ticket.price} onChange={(event) => updateTicket(index, { price: event.target.value })} className={fieldClass} placeholder="Price (GHS)" /><input type="number" min="1" value={ticket.capacity} onChange={(event) => updateTicket(index, { capacity: event.target.value })} className={fieldClass} placeholder="Capacity (∞)" /></div></div>
                </div>
              ))}
              <button type="button" onClick={() => setTickets((rows) => [...rows, { ...blankTicket, label: '' }])} className="create-focus min-h-12 w-full rounded-full border border-[#bdb5a4] font-semibold text-[#4d4b44]">＋ Add another ticket</button>
            </div>
          </section>
        )}

        {error && <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}

        <button type="button" disabled={saving} onClick={step === 3 ? saveDraft : moveForward} className="create-focus mt-8 min-h-14 w-full rounded-full bg-[#2766d2] px-6 font-semibold text-white disabled:opacity-60">
          {saving ? 'Saving draft…' : step === 3 ? 'Save as draft' : 'Continue'}
        </button>
      </main>
    </div>
  )
}
