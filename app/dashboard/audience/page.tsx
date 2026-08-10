import { createClient, getAuthedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AudienceHeader from './AudienceHeader'
import FansClient, { type AudienceResponse } from './FansClient'

export default async function AudiencePage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) redirect('/login')

  const { data: audience, error } = await supabase.rpc('get_organizer_audience', {
    p_page: 1,
    p_page_size: 25,
    p_filter: 'all',
    p_search: '',
  })

  const initialAudience: AudienceResponse = error || !audience
    ? { rows: [], total_count: 0, repeat_count: 0, new_this_month_count: 0, filtered_count: 0, page: 1, page_size: 25 }
    : audience as AudienceResponse

  return (
    <div>
      <AudienceHeader />
      <FansClient initialAudience={initialAudience} initialLoadFailed={Boolean(error || !audience)} />
    </div>
  )
}
