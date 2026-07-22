import { createClient, getAuthedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { PayoutAccount } from '@/lib/types'
import OrganizerProfileForm from './OrganizerProfileForm'
import PayoutAccountsSection from './PayoutAccountsSection'
import { signOut } from '@/lib/auth-actions'

export default async function SettingsPage() {
  const supabase = await createClient()
  const user = await getAuthedUser()
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

      <div className="max-w-6xl grid grid-cols-1 gap-6 lg:grid-cols-[1fr_460px] lg:items-start">
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
        <div className="lg:sticky lg:top-8 space-y-6">
          <PayoutAccountsSection accounts={(payoutAccounts ?? []) as PayoutAccount[]} />
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Account</h2>
            <p className="text-xs text-gray-400 mb-4">{user.email}</p>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm font-semibold px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
