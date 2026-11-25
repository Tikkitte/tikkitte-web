'use client'

import { useRef, useState, type ReactNode } from 'react'
import { Button } from 'tikkitte-ui'
import { extractYouTubeId } from '@/lib/youtube'
import { IMAGE_TYPES } from './EventImageSection'
import { ACCENTS, CheckIcon, CloseIcon, PencilIcon, PlayFrameIcon, PlusIcon, Section, dashedButtonClass, iconButtonClass, inputClass } from './ui'

function SubHeading({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h3 className="text-[15px] font-bold text-[var(--tikkitte-ink)]">{title}</h3>
      <span className="text-[13px] text-[var(--tikkitte-ink-soft)]">{count}</span>
    </div>
  )
}

function RoundButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return <button type="button" aria-label={label} onClick={onClick} className={iconButtonClass}>{children}</button>
}

export default function PreviewMediaSection({ images, uploading, onAddImages, onRemoveImage, videos, onVideosChange, newVideo, onNewVideoChange }: {
  images: string[]
  uploading: boolean
  onAddImages: (files: File[]) => Promise<void>
  onRemoveImage: (index: number) => void
  videos: string[]
  onVideosChange: (videos: string[]) => void
  // The add field's text is saved too, so a pasted link isn't lost if the
  // organizer saves without pressing Add.
  newVideo: string
  onNewVideoChange: (value: string) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState<number | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)
  const notAVideo = 'Paste a YouTube video link.'

  function addVideo() {
    const url = newVideo.trim()
    if (!url) return
    if (!extractYouTubeId(url)) return setLinkError(notAVideo)
    setLinkError(null)
    onVideosChange([...videos, url])
    onNewVideoChange('')
  }

  // Leaving edit mode turns the field back into text, so check it first.
  function finishEditing(i: number) {
    if (!extractYouTubeId(videos[i].trim())) return setLinkError(notAVideo)
    setLinkError(null)
    setEditing(null)
  }

  return (
    <Section id="preview-media" title="Preview media" icon={<PlayFrameIcon />} accent={ACCENTS.media}>
      <SubHeading title="Photos" count={images.length} />
      <input
        ref={fileRef}
        type="file"
        accept={IMAGE_TYPES.join(',')}
        multiple
        className="hidden"
        onChange={async (e) => {
          await onAddImages(Array.from(e.target.files ?? []))
          if (fileRef.current) fileRef.current.value = ''
        }}
      />
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 sm:gap-3">
        {images.map((url, i) => (
          <div key={url + i} className="relative aspect-square overflow-hidden rounded-xl bg-[#e9e4d8]">
            {/* eslint-disable-next-line @next/next/no-img-element -- Supabase URLs in every environment */}
            <img src={url} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label={`Remove photo ${i + 1}`}
              onClick={() => onRemoveImage(i)}
              className="create-focus absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-[rgba(25,25,23,0.72)] text-white"
            >
              <CloseIcon />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className={`${dashedButtonClass} flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl bg-[#faf8f3] text-[13px] disabled:cursor-wait disabled:opacity-60`}
        >
          {!uploading && <span style={{ color: ACCENTS.media.color }}><PlusIcon /></span>}
          {uploading ? 'Uploading…' : 'Add photos'}
        </button>
      </div>

      <div className="mt-6">
        <SubHeading title="YouTube links" count={videos.length} />
        <div className="flex flex-col gap-2.5">
          {videos.map((url, i) => (
            <div key={i} className="flex items-center gap-3 rounded-[14px] border border-[var(--tikkitte-cream-border)] py-2.5 pl-3.5 pr-2.5">
              <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px]" style={{ background: ACCENTS.media.tint, color: ACCENTS.media.color }}>
                <PlayFrameIcon size={16} />
              </span>
              {editing === i ? (
                <>
                  <label htmlFor={`video-${i}`} className="sr-only">YouTube link {i + 1}</label>
                  <input
                    id={`video-${i}`}
                    type="url"
                    autoFocus
                    value={url}
                    onChange={(e) => { setLinkError(null); onVideosChange(videos.map((v, idx) => idx === i ? e.target.value : v)) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); finishEditing(i) } }}
                    className={`${inputClass} h-10`}
                  />
                  <RoundButton label="Done" onClick={() => finishEditing(i)}><CheckIcon size={16} /></RoundButton>
                </>
              ) : (
                <>
                  <span className="min-w-0 flex-1 truncate text-sm text-[var(--tikkitte-ink)]">{url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                  <RoundButton label={`Edit link ${i + 1}`} onClick={() => setEditing(i)}><PencilIcon /></RoundButton>
                </>
              )}
              <RoundButton label={`Remove link ${i + 1}`} onClick={() => { setEditing(null); setLinkError(null); onVideosChange(videos.filter((_, idx) => idx !== i)) }}>
                <CloseIcon size={16} strokeWidth={1.8} />
              </RoundButton>
            </div>
          ))}
          <div className="flex gap-2.5">
            <label htmlFor="new-video" className="sr-only">YouTube link</label>
            <input
              id="new-video"
              type="url"
              value={newVideo}
              onChange={(e) => { setLinkError(null); onNewVideoChange(e.target.value) }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVideo() } }}
              placeholder="Paste a YouTube link"
              className={`${inputClass} h-11 flex-1`}
            />
            <Button type="button" variant="secondary" size="sm" onClick={addVideo} disabled={!newVideo.trim()}>Add</Button>
          </div>
          {linkError && <p role="alert" className="text-[13px] text-[#b42318]">{linkError}</p>}
        </div>
      </div>
    </Section>
  )
}
