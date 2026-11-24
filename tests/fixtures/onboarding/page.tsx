// Copy into app/onboarding-test/page.tsx in an isolated test checkout only.
// It is deliberately outside app/ in the repository and never ships.
import OrganizerIntro from '@/components/dashboard/OrganizerIntro'
import OrganizerApplicationForm from '@/components/dashboard/OrganizerApplicationForm'
import LaunchChecklist from '@/components/dashboard/LaunchChecklist'
import PublishButton from '@/app/dashboard/events/[id]/PublishButton'

export default async function Fixture({searchParams}:{searchParams:Promise<{intro?:string;approved?:string;view?:string;published?:string}>}) {
  const params=await searchParams
  const approved=params.approved==='true'
  return <main className="create-shell min-h-screen bg-[#f4f2ec] p-5">
    {params.view==='application' ? <div className="create-card mx-auto max-w-xl p-6"><OrganizerApplicationForm organizerId="11111111-1111-4111-8111-111111111111"/></div>
      : params.view==='publish' ? <PublishButton eventId="fixture-event" published={params.published==='true'} approved={approved}/>
      : <LaunchChecklist name="Kofi" profileComplete={false} hasInstagram={false} hasPayout={false} approved={approved}/>}
    {params.intro==='1' && <OrganizerIntro approved={approved}/>}
  </main>
}
