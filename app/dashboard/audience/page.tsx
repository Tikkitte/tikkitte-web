import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AudienceTabs from './AudienceTabs'
import FansClient, { type FanRow } from './FansClient'

export default async function AudiencePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: fans } = await supabase.rpc('get_organizer_fans')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Audience</h1>
        <p className="mt-1 text-sm text-gray-500">View and message the people who buy tickets to your events.</p>
      </div>

      <AudienceTabs />
      <FansClient fans={(fans ?? []) as FanRow[]} />
    </div>
  )
}
