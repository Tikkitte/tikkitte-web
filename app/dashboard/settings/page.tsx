import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PayoutAccount } from '@/lib/types'
import OrganizerProfileForm from './OrganizerProfileForm'
import PayoutAccountsSection from './PayoutAccountsSection'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: payoutAccounts }] = await Promise.all([
    supabase
      .from('organizer_profile')
      .select('display_name, email, bio, logo_url, tiktok_url, instagram_url, snapchat_url')
      .eq('id', user.id)
      .maybeSingle(),
    supabase
      .from('payout_account')
      .select('*')
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: true }),
  ])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your public organizer profile.</p>
      </div>

      <div className="max-w-2xl">
        <div className="space-y-6">
          <OrganizerProfileForm
            organizerId={user.id}
            displayName={profile?.display_name ?? ''}
            email={profile?.email ?? user.email ?? ''}
            bio={profile?.bio ?? ''}
            logoUrl={profile?.logo_url ?? null}
            tiktokUrl={profile?.tiktok_url ?? ''}
            instagramUrl={profile?.instagram_url ?? ''}
            snapchatUrl={profile?.snapchat_url ?? ''}
          />
          <PayoutAccountsSection accounts={(payoutAccounts ?? []) as PayoutAccount[]} />
        </div>
      </div>
    </div>
  )
}
