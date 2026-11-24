import { redirect } from 'next/navigation'
import { getOrganizerContext } from '@/lib/organizer-context'
import OrganizerApplicationForm from '@/components/dashboard/OrganizerApplicationForm'
export default async function ApplicationPage() {
  const { user, profile, application } = await getOrganizerContext()
  if (!user) redirect('/login')
  if (!profile || profile.approved || profile.review_status === 'declined' || !application) redirect('/dashboard')
  return <div className="create-card mx-auto max-w-xl p-6"><h1 className="create-display mb-6 text-3xl">Your application</h1>
    <OrganizerApplicationForm organizerId={user.id} initial={application} instagram={profile.instagram_url ?? ''} needsInfo={profile.review_status === 'needs_info'} editing />
  </div>
}
