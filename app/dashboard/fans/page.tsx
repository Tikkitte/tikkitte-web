import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FansClient, { type FanRow } from './FansClient'

export default async function FansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: fans } = await supabase.rpc('get_organizer_fans')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Fans</h1>
        <p className="mt-1 text-sm text-gray-500">View people who have bought tickets across your events.</p>
      </div>

      <FansClient fans={(fans ?? []) as FanRow[]} />
    </div>
  )
}
