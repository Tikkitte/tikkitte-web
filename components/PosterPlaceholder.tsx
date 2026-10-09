import type { CSSProperties } from 'react'

type Props = {
  className?: string
}

// Muted silhouette of the Tikkitte ticket mark, masked from the logo PNG's
// alpha channel so it stays crisp at every size.
const markStyle: CSSProperties = {
  aspectRatio: '360 / 237',
  backgroundColor: '#D3CCB9',
  WebkitMask: 'url(/images/logo.png) center / contain no-repeat',
  mask: 'url(/images/logo.png) center / contain no-repeat',
}

// Shown wherever an event has no poster. It reads as "no poster yet" rather
// than as artwork, so a real event never borrows someone else's flyer.
// Callers pass sizing and rounding only; the background is set here.
export default function PosterPlaceholder({ className = '' }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={{ background: 'radial-gradient(120% 90% at 50% 42%, #F4F2EC 0%, #ECE7D8 58%, #E4DFD1 100%)' }}
    >
      <span className="block w-[34%] min-w-[22px] max-w-[150px]" style={markStyle} />
    </div>
  )
}
