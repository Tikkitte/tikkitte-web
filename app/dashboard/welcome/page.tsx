import { redirect } from 'next/navigation'
import { getOrganizerContext } from '@/lib/organizer-context'
import OrganizerApplicationForm from '@/components/dashboard/OrganizerApplicationForm'
export default async function WelcomePage() {
  const { user, profile, application } = await getOrganizerContext()
  if (!user) redirect('/login')
  if (!profile || profile.approved || profile.review_status === 'declined' || application) redirect('/dashboard')
  return <div className="min-h-screen bg-gray-50 px-5 py-12"><div className="create-card mx-auto max-w-xl p-6 sm:p-8">
    <h1 className="create-display text-3xl">Tell us about your events</h1><p className="mb-7 mt-2 text-sm text-gray-500">You can prepare your profile and first event while we review your account.</p>
    <OrganizerApplicationForm organizerId={user.id} instagram={profile.instagram_url ?? ''} />
  </div></div>
}
