'use client'

import { useState } from 'react'

function extractYouTubeId(url: string): string | null {
  return url.match(/(?:watch\?v=|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? null
}

type Item =
  | { type: 'image'; url: string }
  | { type: 'video'; url: string; videoId: string }

type Props = {
  images: string[]
  videos: string[]
}

export default function EventPreviewGallery({ images, videos }: Props) {
  const items: Item[] = [
    ...images.map(url => ({ type: 'image' as const, url })),
    ...videos.flatMap(url => {
      const videoId = extractYouTubeId(url)
      return videoId ? [{ type: 'video' as const, url, videoId }] : []
    }),
  ]

  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const open = (index: number) => setActiveIndex(index)

  const close = () => {
    setActiveIndex(null)
  }

  const prev = () => setActiveIndex(i => (i === null || i === 0 ? items.length - 1 : i - 1))
  const next = () => setActiveIndex(i => (i === null || i === items.length - 1 ? 0 : i + 1))

  const active = activeIndex !== null ? items[activeIndex] : null

  return (
    <>
      {/* Horizontal strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item, i) => {
          if (item.type === 'image') {
            return (
              <button
                key={`img-${i}`}
                type="button"
                onClick={() => open(i)}
                className="flex-shrink-0 w-40 h-[110px] rounded-xl overflow-hidden bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </button>
            )
          }

          const thumb = `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`
          return (
            <button
              key={`vid-${i}`}
              type="button"
              onClick={() => open(i)}
              className="relative flex-shrink-0 w-40 h-[110px] rounded-xl overflow-hidden bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb}
                alt={`Video preview ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
          onClick={close}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={close}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Counter */}
          {items.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm tabular-nums">
              {(activeIndex ?? 0) + 1} / {items.length}
            </div>
          )}

          {/* Prev arrow */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Previous"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Content */}
          <div className="flex items-center justify-center" onClick={e => e.stopPropagation()}>
            {active.type === 'image' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={active.url}
                alt="Preview"
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl"
              />
            ) : (
              <iframe
                key={active.videoId}
                src={`https://www.youtube.com/embed/${active.videoId}?autoplay=1`}
                allow="autoplay; fullscreen"
                allowFullScreen
                className="w-[80vw] max-w-3xl aspect-video rounded-xl"
                title="Video preview"
              />
            )}
          </div>

          {/* Next arrow */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Next"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          )}
        </div>
      )}
    </>
  )
}
