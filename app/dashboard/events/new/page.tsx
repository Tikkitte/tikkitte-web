import { getAuthedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MobileEventWizard from '@/components/dashboard/MobileEventWizard'

export default async function NewEventPage() {
  const user = await getAuthedUser()
  if (!user) redirect('/login')

  return <MobileEventWizard organizerId={user.id} />
}
