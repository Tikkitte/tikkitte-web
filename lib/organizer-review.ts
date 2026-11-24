export type OrganizerReviewTab = 'pending' | 'approved' | 'declined' | 'all'
type SortableOrganizer = {
  review_status: string
  created_at: string
  application: { submitted_at?: string | boolean | null } | null
}

export function sortOrganizers<T extends SortableOrganizer>(rows: T[], tab: OrganizerReviewTab): T[] {
  return rows.filter(row => tab === 'all' || (tab === 'pending'
    ? ['pending', 'needs_info'].includes(row.review_status) : row.review_status === tab))
    .sort((a, b) => tab === 'pending'
      ? String(a.application?.submitted_at ?? a.created_at).localeCompare(String(b.application?.submitted_at ?? b.created_at))
      : b.created_at.localeCompare(a.created_at))
}
