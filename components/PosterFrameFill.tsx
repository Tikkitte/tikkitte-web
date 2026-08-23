'use client'

import Image from 'next/image'
import { usePosterAverageColor } from '@/lib/usePosterAverageColor'

type Props = {
  src: string
  alt: string
  sizes: string
  className?: string
  priority?: boolean
  quality?: number
}

const FILL_FALLBACK = '#ECE7D8'

// Client-only half of PosterFrame's 'fill' variant — isolated here so the
// default 'blur' variant (used everywhere except the homepage cards) stays a
// server component and doesn't pay for this hook's hydration.
export default function PosterFrameFill({ src, alt, sizes, className = '', priority, quality }: Props) {
  const fillColor = usePosterAverageColor(src, FILL_FALLBACK)

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, ${fillColor}, color-mix(in srgb, ${fillColor} 70%, black))` }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={priority}
        quality={quality}
        className="relative z-10 object-contain"
      />
    </div>
  )
}
