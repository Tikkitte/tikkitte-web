import { createClient } from '@/lib/supabase/server'
import type { Payout, PayoutAccount } from '@/lib/types'
import PayoutsClient, { type PayoutAdminRow } from './PayoutsClient'
import AdminPageHeader from '../AdminPageHeader'

type OrganizerSummary = {
  id: string
  display_name: string
  email: string
}

export default async function AdminPayoutsPage() {
  const supabase = await createClient()

  const { data: rawPayouts } = await supabase
    .from('payout')
    .select('*')
    .order('created_at', { ascending: false })

  const payouts = (rawPayouts ?? []) as Payout[]
  const organizerIds = Array.from(new Set(payouts.map((payout) => payout.organizer_id)))
  const accountIds = Array.from(new Set(
    payouts
      .map((payout) => payout.payout_account_id)
      .filter((id): id is string => Boolean(id))
  ))
  const eventIds = Array.from(new Set(
    payouts.map((payout) => payout.event_id).filter((id): id is string => Boolean(id))
  ))

  const [{ data: profiles }, { data: accounts }, { data: events }] = await Promise.all([
    organizerIds.length
      ? supabase.from('organizer_profile').select('id, display_name, email').in('id', organizerIds)
      : Promise.resolve({ data: [] as OrganizerSummary[] }),
    accountIds.length
      ? supabase.from('payout_account').select('*').in('id', accountIds)
      : Promise.resolve({ data: [] as PayoutAccount[] }),
    eventIds.length
      ? supabase.from('event').select('id, name, slug').in('id', eventIds)
      : Promise.resolve({ data: [] as Array<{ id: string; name: string; slug: string | null }> }),
  ])

  const profileById = new Map(((profiles ?? []) as OrganizerSummary[]).map((profile) => [profile.id, profile]))
  const accountById = new Map(((accounts ?? []) as PayoutAccount[]).map((account) => [account.id, account]))
  const eventById = new Map(((events ?? []) as Array<{ id: string; name: string; slug: string | null }>).map((event) => [event.id, event]))

  const rows: PayoutAdminRow[] = payouts.map((payout) => ({
    payout,
    organizer: profileById.get(payout.organizer_id),
    account: payout.payout_account_id ? accountById.get(payout.payout_account_id) : undefined,
    event: payout.event_id ? eventById.get(payout.event_id) : undefined,
  }))

  return (
    <div>
      <AdminPageHeader title="Payouts" description="Review payout destinations and confirm transfers after they have been sent." />
      <PayoutsClient rows={rows} />
    </div>
  )
}
