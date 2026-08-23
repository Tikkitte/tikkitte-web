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
