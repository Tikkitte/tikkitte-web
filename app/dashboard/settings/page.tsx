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
        <h1 className="create-display text-[34px]">Settings</h1>
        <p className="mt-1 text-sm text-[var(--tikkitte-ink-soft)]">Manage your organizer profile and payout destination.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
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
        <div className="space-y-6 lg:sticky lg:top-8">
          <PayoutAccountsSection accounts={(payoutAccounts ?? []) as PayoutAccount[]} />
          <div className="create-card p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">Account</h2>
            <p className="text-xs text-gray-400 mb-4">{user.email}</p>
            <form action={signOut}>
              <button
                type="submit"
                className="create-focus min-h-11 rounded-full border border-[var(--tikkitte-cream-border)] px-5 text-sm font-semibold hover:border-[var(--tikkitte-ink)]"
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
