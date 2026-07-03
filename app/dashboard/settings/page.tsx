import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrganizerProfileForm from './OrganizerProfileForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('organizer_profile')
    .select('display_name, email, logo_url, bio')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your public organizer profile.</p>
      </div>

      <div className="max-w-2xl">
        <OrganizerProfileForm
          displayName={profile?.display_name ?? ''}
          email={profile?.email ?? user.email ?? ''}
          bio={profile?.bio ?? ''}
          logoUrl={profile?.logo_url ?? ''}
        />
      </div>
    </div>
  )
}
