'use client'

import { usePosterAverageColor } from '@/lib/usePosterAverageColor'

type Props = {
  posterSrc: string | null
  className?: string
  children: React.ReactNode
}

const FALLBACK_BORDER = '#E4DFD1'

export default function PosterOutlineCard({ posterSrc, className = '', children }: Props) {
  const borderColor = usePosterAverageColor(posterSrc, FALLBACK_BORDER)

  return (
    <div className={className} style={{ borderColor }}>
      {children}
    </div>
  )
}
