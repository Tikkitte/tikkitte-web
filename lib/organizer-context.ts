import { cache } from 'react'
import { createClient, getAuthedUser } from '@/lib/supabase/server'
import type { ReviewStatus } from './organizer-access'

export const getOrganizerContext = cache(async () => {
  const user = await getAuthedUser()
  if (!user || user.is_anonymous) return { user: null, profile: null, application: null }
  const supabase = await createClient()
  const [profile, application] = await Promise.all([
    supabase.from('organizer_profile').select('id, display_name, approved, review_status, logo_url, bio, instagram_url').eq('id', user.id).maybeSingle(),
    supabase.from('organizer_application').select('*').eq('organizer_id', user.id).maybeSingle(),
  ])
  if (profile.error || application.error) throw new Error('Unable to load organizer account. Please try again.')
  return { user, profile: profile.data as null | { id: string; display_name: string; approved: boolean; review_status: ReviewStatus; logo_url: string | null; bio: string | null; instagram_url: string | null }, application: application.data }
})
