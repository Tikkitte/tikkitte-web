const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim().toLowerCase()
  if (trimmed.length === 0 || trimmed.length > 254) return null
  return EMAIL_RE.test(trimmed) ? trimmed : null
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
