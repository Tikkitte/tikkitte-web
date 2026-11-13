export const TRACKING_REF_PATTERN = /^[a-z0-9-]{2,20}$/
export const TRACKING_REF_TTL_MS = 7 * 24 * 60 * 60 * 1000

export function normalizeTrackingRef(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const slug = value.trim().toLowerCase()
  return TRACKING_REF_PATTERN.test(slug) ? slug : null
}

function isFresh(at: unknown, now: number): at is number {
  return typeof at === 'number' && Number.isFinite(at) && at <= now && now - at < TRACKING_REF_TTL_MS
}

export function rememberTrackingRef(eventId: string, slug: string, at = Date.now()): void {
  const normalized = normalizeTrackingRef(slug)
  if (!normalized || !Number.isFinite(at)) return
  try {
    localStorage.setItem(`tikkitte:tracking-ref:${eventId}`, JSON.stringify({ slug: normalized, at }))
  } catch {
    // Storage can be unavailable. Checkout can still use its timestamped page ref.
  }
}

export function recallTrackingRef(eventId: string, now = Date.now()): { slug: string; at: number } | null {
  const key = `tikkitte:tracking-ref:${eventId}`
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    let entry: unknown
    try {
      entry = JSON.parse(raw)
    } catch {
      localStorage.removeItem(key)
      return null
    }
    if (entry && typeof entry === 'object' && 'slug' in entry && 'at' in entry) {
      const slug = normalizeTrackingRef(entry.slug)
      if (slug && isFresh(entry.at, now)) return { slug, at: entry.at }
    }
    localStorage.removeItem(key)
  } catch {
    // Reading or removing storage must never interrupt checkout.
  }
  return null
}

export function resolveTrackingRef(
  eventId: string,
  pageRef: string | null,
  pageRefSeenAt: number | null,
  now = Date.now(),
): string | null {
  const stored = recallTrackingRef(eventId, now)
  const slug = normalizeTrackingRef(pageRef)
  if (slug && isFresh(pageRefSeenAt, now) && (!stored || pageRefSeenAt > stored.at)) return slug
  return stored?.slug ?? null
}
