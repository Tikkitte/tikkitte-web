import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EventForm from '@/components/dashboard/EventForm'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('event')
    .select('*')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .maybeSingle()

  if (!event) notFound()

  const { data: tickets } = await supabase
    .from('ticket')
    .select('*')
    .eq('event_id', id)
    .order('type')

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 max-w-2xl mx-auto">Edit event</h1>
      <EventForm event={event} tickets={tickets ?? []} organizerId={user.id} />
    </div>
  )
}
