import { createClient } from '@/lib/supabase/server'
import OrganizersClient, { type OrganizerAdminRow } from './OrganizersClient'

export default async function AdminOrganizersPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('organizer_profile')
    .select('id, display_name, email, logo_url, created_at, approved, slug')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Organizers</h1>
        <p className="mt-1 text-sm text-gray-500">Review and approve organizer accounts.</p>
      </div>
      <OrganizersClient organizers={(data ?? []) as OrganizerAdminRow[]} />
    </div>
  )
}
