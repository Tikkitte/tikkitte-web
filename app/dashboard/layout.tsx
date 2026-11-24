import { getOrganizerContext } from '@/lib/organizer-context'
import ReviewBanner from '@/components/dashboard/ReviewBanner'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import MobileTabBar from '@/components/dashboard/MobileTabBar'
import { signOut } from '@/lib/auth-actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, application } = await getOrganizerContext()
  if (!user) redirect('/login')
  if (!profile || profile.review_status === 'declined' || (!profile.approved && !application)) return <>{children}</>

  return (
    <div className="create-shell flex h-dvh overflow-hidden bg-[var(--tikkitte-cream)]">
      <DashboardSidebar
        displayName={profile.display_name ?? user.email ?? 'Organizer'}
        logoUrl={profile.logo_url ?? null}
        signOutAction={signOut}
        approved={profile.approved}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-8 pt-[max(24px,env(safe-area-inset-top))] md:px-8 md:py-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1220px]">
            {!profile.approved && <ReviewBanner needsInfo={profile.review_status === 'needs_info'} contact={application?.preferred_contact} />}
            {children}
          </div>
        </main>
        <MobileTabBar approved={profile.approved} />
      </div>
    </div>
  )
}
