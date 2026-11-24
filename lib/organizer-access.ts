export type ReviewStatus = 'pending' | 'needs_info' | 'declined' | 'approved'
export type OrganizerAccess = {
  signedIn: boolean
  anonymous?: boolean
  profile: { approved: boolean; review_status: ReviewStatus } | null
  hasApplication: boolean
}

export function organizerRedirect(path: string, state: OrganizerAccess): string | null {
  if (!state.signedIn || state.anonymous) return '/login'
  const destination = !state.profile ? '/dashboard/pending'
    : state.profile.approved ? null
    : state.profile.review_status === 'declined' ? '/dashboard/declined'
    : !state.hasApplication ? '/dashboard/welcome' : null
  if (destination) return path === destination ? null : destination
  if (['/dashboard/pending', '/dashboard/welcome', '/dashboard/declined'].includes(path)) return '/dashboard'
  if (state.profile?.approved && path === '/dashboard/application') return '/dashboard'
  if (!state.profile?.approved && (path === '/dashboard/audience' || path.startsWith('/dashboard/audience/'))) return '/dashboard'
  return null
}
