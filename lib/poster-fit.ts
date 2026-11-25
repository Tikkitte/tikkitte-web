// How well an event poster suits the public site. The site never crops a
// poster: it shows it whole and fills spare space with a blurred copy
// (components/PosterFrame.tsx), so the only questions are shape and size.
const IDEAL_RATIO = 9 / 16
// Roughly the event page's poster area on a phone, in device pixels.
const PHONE_FRAME = { width: 800, height: 1066 }
const MAX_ENLARGEMENT = 1.4

export type PosterFit = 'perfect' | 'edges' | 'small'

export function posterFit(width: number, height: number): PosterFit {
  const enlargement = Math.min(PHONE_FRAME.width / width, PHONE_FRAME.height / height)
  if (enlargement > MAX_ENLARGEMENT) return 'small'
  return Math.abs(width / height - IDEAL_RATIO) <= 0.02 ? 'perfect' : 'edges'
}
