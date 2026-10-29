import { createClient } from '@/lib/supabase/server'
import OrganizersClient, { type OrganizerAdminRow } from './OrganizersClient'
import AdminPageHeader from '../AdminPageHeader'

export default async function AdminOrganizersPage() {
  const supabase = await createClient()

  const [{ data }, defaultsResult] = await Promise.all([
    supabase
      .from('organizer_profile')
      .select('id, display_name, email, logo_url, created_at, approved, slug, platform_fee_percent, service_fee_percent')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase.rpc('admin_get_platform_fee_defaults'),
  ])
  if (defaultsResult.error) console.error('[admin-organizers] failed to load fee defaults:', defaultsResult.error.message)
  const defaults = defaultsResult.error ? null : defaultsResult.data
  const readPercent = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null

  return (
    <div>
      <AdminPageHeader title="Organizers" description="Review organizer access, new-event platform fees, and customer service fees." />
      <OrganizersClient
        organizers={(data ?? []) as OrganizerAdminRow[]}
        platformFeePercentDefault={readPercent(defaults?.platformFeePercentDefault)}
        serviceFeePercent={readPercent(defaults?.serviceFeePercent)}
      />
    </div>
  )
}
