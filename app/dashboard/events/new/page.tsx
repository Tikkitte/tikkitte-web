import { getAuthedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EventForm from '@/components/dashboard/EventForm'

export default async function NewEventPage() {
  const user = await getAuthedUser()
  if (!user) redirect('/login')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8 max-w-2xl mx-auto">Create event</h1>
      <EventForm organizerId={user.id} showPreview />
    </div>
  )
}
