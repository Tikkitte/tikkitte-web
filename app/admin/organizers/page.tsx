import { createClient } from '@/lib/supabase/server'
import { fetchAllRows } from '@/lib/fetch-all-rows'
import OrganizersClient, { type OrganizerAdminRow } from './OrganizersClient'
import AdminPageHeader from '../AdminPageHeader'

type ProfileRow = Omit<OrganizerAdminRow, 'application' | 'events'>
const profileFields = 'id, display_name, email, logo_url, created_at, approved, slug, platform_fee_percent, service_fee_percent, bio, instagram_url, review_status, approved_at'

export default async function AdminOrganizersPage() {
  const supabase = await createClient()
  const [pending, recent, defaultsResult] = await Promise.all([
    fetchAllRows<ProfileRow>((from, to) => supabase.from('organizer_profile')
      .select(profileFields).in('review_status', ['pending', 'needs_info'])
      .order('created_at').order('id').range(from, to), row => row.id),
    supabase.from('organizer_profile').select(profileFields)
      .in('review_status', ['approved', 'declined']).order('created_at', { ascending: false }).order('id').limit(200),
    supabase.rpc('admin_get_platform_fee_defaults'),
  ])
  if (pending.error || recent.error) throw new Error('Unable to load organizers.')
  if (defaultsResult.error) console.error('[admin-organizers] failed to load fee defaults:', defaultsResult.error.message)
  const profiles = [...new Map([...(pending.data ?? []), ...(recent.data ?? [])].map(row => [row.id, row])).values()]
  const reviewIds = profiles.filter(row => !row.approved).map(row => row.id)
  // Bound IN filters as well as paging results; a large pending queue must not
  // turn into an oversized request or silently truncate the event list.
  const batches = Array.from({ length: Math.ceil(reviewIds.length / 100) }, (_, i) => reviewIds.slice(i * 100, i * 100 + 100))
  const details = await Promise.all(batches.map(async ids => {
    const [applications, events] = await Promise.all([
      fetchAllRows<Record<string, string | boolean | null> & { organizer_id: string }>((from, to) => supabase.from('organizer_application')
        .select('*').in('organizer_id', ids).order('organizer_id').range(from, to), row => row.organizer_id),
      fetchAllRows<OrganizerAdminRow['events'][number] & { organizer_id: string }>((from, to) => supabase.from('event')
        .select('id, organizer_id, name, date, published, tickets:ticket(label, price)').in('organizer_id', ids)
        .order('created_at').order('id').range(from, to), row => row.id),
    ])
    if (applications.error || events.error) throw new Error('Unable to load organizer review details.')
    return { applications: applications.data ?? [], events: events.data ?? [] }
  }))
  const applications = new Map(details.flatMap(batch => batch.applications).map(row => [row.organizer_id, row]))
  const events = details.flatMap(batch => batch.events)
  const rows = profiles.map(row => ({ ...row, application: applications.get(row.id) ?? null, events: events.filter(event => event.organizer_id === row.id) }))
  const defaults = defaultsResult.error ? null : defaultsResult.data
  const readPercent = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null
  return <div>
    <AdminPageHeader title="Organizers" description="Review organizer access, new-event platform fees, and customer service fees." />
    <OrganizersClient now={new Date().getTime()} organizers={rows} platformFeePercentDefault={readPercent(defaults?.platformFeePercentDefault)} serviceFeePercent={readPercent(defaults?.serviceFeePercent)} />
  </div>
}
