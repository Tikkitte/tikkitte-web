const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return 'TBA'
  const [y, m, d] = dateStr.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

// Year-less variant for public browsing surfaces (event page, homepage,
// organizer page) where the year is implied by context. Ticket/confirmation
// receipts and admin tools keep the full formatDate — those are records
// someone might read long after the fact, where the year still matters.
export function formatDateShort(dateStr: string | null | undefined) {
  if (!dateStr) return 'TBA'
  const [, m, d] = dateStr.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}`
}

export function formatTime(timeStr: string | null | undefined) {
  if (!timeStr) return ''
  const [hh, mm] = timeStr.split(':').map(Number)
  const am = hh < 12
  const h12 = ((hh + 11) % 12) + 1
  return `${h12}:${String(mm).padStart(2, '0')} ${am ? 'AM' : 'PM'}`
}

// Small joining words stay lowercase unless they start the name.
const TITLE_CASE_MINOR_WORDS = new Set(['a', 'an', 'and', 'at', 'by', 'de', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'with'])

// Venue names are typed freely by organizers ("AFIENYA AIR FIELD", "Velvet luxury
// lodge apartments"). Show them in title case. When the name is not entirely
// capitals, all-caps words (VIP, KFC) and mixed-case words (McDonald's) are kept
// as typed, since they were written that way on purpose.
export function toTitleCase(value: string): string {
  const shouting = !/[a-z]/.test(value)
  let wordIndex = 0
  return value.replace(/[\p{L}\p{N}'’]+/gu, (word) => {
    const first = wordIndex++ === 0
    if (!shouting && word.length > 1 && (word === word.toUpperCase() || /[A-Z]/.test(word.slice(1)))) return word
    const lower = word.toLowerCase()
    if (!first && TITLE_CASE_MINOR_WORDS.has(lower)) return lower
    return lower.charAt(0).toUpperCase() + lower.slice(1)
  })
}
