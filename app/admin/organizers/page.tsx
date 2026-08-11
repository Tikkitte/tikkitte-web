import { createClient } from '@/lib/supabase/server'
import OrganizersClient, { type OrganizerAdminRow } from './OrganizersClient'
import AdminPageHeader from '../AdminPageHeader'

export default async function AdminOrganizersPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('organizer_profile')
    .select('id, display_name, email, logo_url, created_at, approved, slug, platform_fee_percent')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div>
      <AdminPageHeader title="Organizers" description="Review organizer access and set the default fee applied when each new event is created." />
      <OrganizersClient organizers={(data ?? []) as OrganizerAdminRow[]} />
    </div>
  )
}
