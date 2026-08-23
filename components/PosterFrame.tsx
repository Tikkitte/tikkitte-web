import Image from 'next/image'
import PosterFrameFill from '@/components/PosterFrameFill'

type Props = {
  src: string
  alt: string
  sizes: string
  className?: string
  priority?: boolean
  quality?: number
  // 'blur': blurred/extended copy of the poster fills the letterbox space
  //   (original treatment, used everywhere by default). Server-rendered.
  // 'fill': solid gradient sampled from the poster's own dominant color
  //   fills the letterbox space instead — calmer in dense grids where many
  //   posters render side by side. Opt-in per call site; needs a client
  //   component to sample the color, so it's split into PosterFrameFill
  //   rather than making every 'blur' instance pay for that hydration too.
  variant?: 'blur' | 'fill'
}

// Shows the full poster, uncropped, on a background that extends its own
// colors — either a blurred duplicate or a sampled color fill — so a poster
// renders correctly in a box shorter than its native ratio (object-cover
// would otherwise crop the flyer's edges to fill the box).
export default function PosterFrame({ src, alt, sizes, className = '', priority, quality, variant = 'blur' }: Props) {
  if (variant === 'fill') {
    return <PosterFrameFill src={src} alt={alt} sizes={sizes} className={className} priority={priority} quality={quality} />
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        width={128}
        height={128}
        quality={20}
        className="absolute inset-0 h-full w-full scale-110 object-cover"
        style={{ filter: 'blur(40px) brightness(0.6) saturate(1.2)' }}
      />
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
