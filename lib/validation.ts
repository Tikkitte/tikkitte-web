const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim().toLowerCase()
  if (trimmed.length === 0 || trimmed.length > 254) return null
  return EMAIL_RE.test(trimmed) ? trimmed : null
}

const COMMON_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'icloud.com',
  'live.com',
  'aol.com',
  'msn.com',
]

function levenshteinDistance(a: string, b: string): number {
  const dist: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dist[i][0] = i
  for (let j = 0; j <= b.length; j++) dist[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dist[i][j] = Math.min(dist[i - 1][j] + 1, dist[i][j - 1] + 1, dist[i - 1][j - 1] + cost)
    }
  }
  return dist[a.length][b.length]
}

// Suggests a fix for likely email domain typos (e.g. "gamil.com" -> "gmail.com")
// against a short list of common providers. Only a suggestion, never blocks
// submission — the syntax-only EMAIL_RE above happily accepts typo'd domains,
// which is exactly how these go unnoticed until the confirmation email bounces.
export function suggestEmailDomain(email: string): string | null {
  const at = email.lastIndexOf('@')
  if (at === -1) return null
  const domain = email.slice(at + 1).toLowerCase()
  if (COMMON_EMAIL_DOMAINS.includes(domain)) return null

  let closest: string | null = null
  let closestDistance = Infinity
  for (const candidate of COMMON_EMAIL_DOMAINS) {
    const distance = levenshteinDistance(domain, candidate)
    if (distance < closestDistance) {
      closestDistance = distance
      closest = candidate
    }
  }
  if (!closest || closestDistance === 0 || closestDistance > 2) return null
  return `${email.slice(0, at + 1)}${closest}`
}

export function sanitizeName(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  return raw
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 100)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const FREE_REF_RE = /^FREE-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isValidReference(ref: unknown): boolean {
  if (typeof ref !== 'string') return false
  const trimmed = ref.trim()
  return UUID_RE.test(trimmed) || FREE_REF_RE.test(trimmed) || /^[a-zA-Z0-9_-]{6,64}$/.test(trimmed)
}

export function isValidUUID(id: unknown): boolean {
  if (typeof id !== 'string') return false
  return UUID_RE.test(id.trim())
}
