import { getOrganizerContext } from '@/lib/organizer-context'
import { createClient, getAuthedUser } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import EventForm from '@/components/dashboard/EventForm'

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) redirect('/login')
  const organizerApproved = Boolean((await getOrganizerContext()).profile?.approved)

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

  return <EventForm event={event} tickets={tickets ?? []} organizerId={user.id} organizerApproved={organizerApproved} />
}
