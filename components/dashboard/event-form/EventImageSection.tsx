'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from 'tikkitte-ui'
import { posterFit, type PosterFit } from '@/lib/poster-fit'
import { ACCENTS, CheckCircleIcon, ImageIcon, InfoIcon, Section, UploadIcon } from './ui'

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Posters are never cropped on the site, so the section says how well this one fits.
const FIT_LINE: Record<PosterFit, { text: string; className: string; icon: 'check' | 'info' }> = {
  perfect: { text: 'Perfect fit', className: 'text-[#1f7a5c]', icon: 'check' },
  edges: { text: 'Fits', className: 'text-[#1f7a5c]', icon: 'check' },
  small: { text: 'Too small, may look blurry', className: 'text-[#8a5a12]', icon: 'info' },
}

export default function EventImageSection({ imageUrl, uploading, onFile }: {
  imageUrl: string | null
  uploading: boolean
  onFile: (file: File) => Promise<void>
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [size, setSize] = useState<{ src: string; width: number; height: number } | null>(null)
  const shown = localPreview ?? imageUrl
  const fit = shown && size?.src === shown ? FIT_LINE[posterFit(size.width, size.height)] : null

  useEffect(() => () => { if (localPreview) URL.revokeObjectURL(localPreview) }, [localPreview])

  // Measured with a separate image: the visible one can finish loading before
  // hydration, when an onLoad handler would never fire.
  useEffect(() => {
    if (!shown) return
    let active = true
    const probe = new window.Image()
    probe.onload = () => { if (active) setSize({ src: shown, width: probe.naturalWidth, height: probe.naturalHeight }) }
    probe.src = shown
    return () => { active = false }
  }, [shown])

  async function take(file: File | undefined) {
    if (!file || uploading) return
    // Show the picked file straight away; the parent validates and uploads it.
    const preview = IMAGE_TYPES.includes(file.type) ? URL.createObjectURL(file) : null
    setLocalPreview(preview)
    try {
      await onFile(file)
    } finally {
      setLocalPreview(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <Section id="event-image" title="Event image" icon={<ImageIcon />} accent={ACCENTS.image}>
      <input ref={fileRef} type="file" accept={IMAGE_TYPES.join(',')} onChange={(e) => void take(e.target.files?.[0])} className="hidden" />
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); void take(e.dataTransfer.files?.[0]) }}
        className={`flex items-center gap-4 rounded-2xl sm:gap-6 ${dragging ? 'ring-2 ring-[var(--tikkitte-blue-bright)] ring-offset-4' : ''}`}
      >
        <div className="relative w-[120px] shrink-0 overflow-hidden rounded-xl sm:w-[168px]">
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element -- a just-picked local file and Supabase URLs, without the optimizer
            <img
              src={shown}
              alt="Event poster"
              className="block max-h-[360px] w-full rounded-xl bg-[#ebe7dc] object-contain shadow-[0_6px_18px_rgba(25,25,23,0.12)]"
            />
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="create-focus flex aspect-[9/16] w-full flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#c9c2ad] bg-[#faf8f3] p-2 text-center text-[var(--tikkitte-ink-soft)]"
            >
              <UploadIcon />
              <span className="text-[12.5px] font-bold text-[var(--tikkitte-ink)]">
                <span className="hidden sm:inline">Drop poster</span><span className="sm:hidden">Add poster</span>
              </span>
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 flex flex-col justify-end gap-2 rounded-xl bg-[rgba(25,25,23,0.55)] p-3">
              <span className="text-[12.5px] font-bold text-white">Uploading…</span>
              <span role="progressbar" aria-label="Uploading poster" className="block h-1 overflow-hidden rounded bg-white/30">
                <span className="block h-1 w-2/5 animate-[poster-upload_1.2s_ease-in-out_infinite] bg-white motion-reduce:w-full motion-reduce:animate-none" />
              </span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          {fit && (
            <p role="status" className={`flex items-start gap-1.5 text-[15px] font-bold leading-snug sm:text-[17px] ${fit.className}`}>
              <span className="mt-px flex shrink-0">{fit.icon === 'check' ? <CheckCircleIcon /> : <InfoIcon />}</span>
              <span>{fit.text}</span>
            </p>
          )}
          <p className="text-[13.5px] leading-[1.45] text-[var(--tikkitte-ink-soft)] sm:text-[15px]">Shown in full everywhere.</p>
          <Button
            type="button"
            variant={shown ? 'secondary' : 'primary'}
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="mt-3"
          >
            {imageUrl ? 'Replace image' : 'Upload image'}
          </Button>
          <p className="mt-2 text-[12.5px] leading-[1.45] text-[var(--tikkitte-ink-soft)] sm:text-[13.5px]">Best at 1080 × 1920. Max 5 MB.</p>
        </div>
      </div>
    </Section>
  )
}
