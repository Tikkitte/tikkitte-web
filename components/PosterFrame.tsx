import Image from 'next/image'

type Props = {
  src: string
  alt: string
  sizes: string
  className?: string
  priority?: boolean
  quality?: number
}

// Shows the full poster, uncropped, on a blurred/extended copy of itself —
// same treatment the public event page pioneered, now shared everywhere a
// poster renders in a box shorter than its native ratio (object-cover would
// otherwise crop the flyer's edges to fill the box).
export default function PosterFrame({ src, alt, sizes, className = '', priority, quality }: Props) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        width={32}
        height={32}
        quality={20}
        className="absolute inset-0 h-full w-full scale-110 object-cover"
        style={{ filter: 'blur(28px) brightness(0.45) saturate(1.2)' }}
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
