type Entry = { count: number; resetAt: number }

const buckets = new Map<string, Entry>()

// Cleanup stale entries periodically (every 60s)
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key)
  }
}

/**
 * Simple in-memory rate limiter.
 * Returns { ok: true } if the request is within limits,
 * or { ok: false, retryAfterMs } if rate-limited.
 */
export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: true } | { ok: false; retryAfterMs: number } {
  cleanup()
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true }
  }

  if (entry.count < limit) {
    entry.count++
    return { ok: true }
  }

  return { ok: false, retryAfterMs: entry.resetAt - now }
}
