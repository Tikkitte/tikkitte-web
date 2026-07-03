import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar
        displayName={profile.display_name ?? user.email ?? 'Organizer'}
        logoUrl={profile.logo_url ?? null}
        signOutAction={signOut}
      />
      <main className="min-h-screen flex-1 px-8 py-8 pl-[16rem]">
        <div className="mx-auto w-full max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
