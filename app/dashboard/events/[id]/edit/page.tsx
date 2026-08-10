import { createClient, getAuthedUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EventForm from '@/components/dashboard/EventForm'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getAuthedUser()
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
    .eq('is_table_ticket', false)
    .order('type')

  return (
    <div>
      <div className="mb-8 lg:pl-[212px]">
        <p className="text-sm font-semibold text-[#2766d2]">Event settings</p>
        <h1 className="create-display mt-1 text-4xl text-[#25251f] sm:text-5xl">Edit event</h1>
        <p className="mt-2 max-w-2xl truncate text-sm text-[#77746b]">{event.name}</p>
      </div>
      <EventForm event={event} tickets={tickets ?? []} organizerId={user.id} />
    </div>
  )
}
