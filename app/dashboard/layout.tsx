import { createClient, getAuthedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import MobileTabBar from '@/components/dashboard/MobileTabBar'
import { signOut } from '@/lib/auth-actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('organizer_profile')
    .select('display_name, approved, logo_url')
    .eq('id', user.id)
    .maybeSingle()

  // Unapproved organizers see the pending page without the dashboard shell
  if (!profile?.approved) {
    return <>{children}</>
  }

  return (
    <div className="create-shell flex h-dvh overflow-hidden bg-[var(--tikkitte-cream)]">
      <DashboardSidebar
        displayName={profile.display_name ?? user.email ?? 'Organizer'}
        logoUrl={profile.logo_url ?? null}
        signOutAction={signOut}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-8 pt-[max(24px,env(safe-area-inset-top))] md:px-8 md:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1220px]">
            {children}
          </div>
        </main>
        <MobileTabBar />
      </div>
    </div>
  )
}
