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
    <div className="flex h-dvh overflow-hidden bg-gray-50">
      <DashboardSidebar
        displayName={profile.display_name ?? user.email ?? 'Organizer'}
        logoUrl={profile.logo_url ?? null}
        signOutAction={signOut}
      />
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-6xl">
            {children}
          </div>
        </main>
        <MobileTabBar />
      </div>
    </div>
  )
}
