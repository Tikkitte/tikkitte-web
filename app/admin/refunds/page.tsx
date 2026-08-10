import { createClient } from '@/lib/supabase/server'
import RefundsClient, { type RefundAdminRow, type RefundPayment } from './RefundsClient'
import AdminPageHeader from '../AdminPageHeader'

export default async function AdminRefundsPage() {
  const supabase = await createClient()

  const { data: rawPayments } = await supabase
    .from('payments')
    .select('id, reference, event_id, user_id, amount, refund_status, refund_reference, refunded_at, refund_error, created_at')
    .not('refund_status', 'is', null)
    .neq('refund_status', 'success')
    .order('created_at', { ascending: false })

  const payments = (rawPayments ?? []) as RefundPayment[]
  const eventIds = Array.from(new Set(payments.map((payment) => payment.event_id)))

  const { data: events } = eventIds.length
    ? await supabase.from('event').select('id, name').in('id', eventIds)
    : { data: [] as { id: string; name: string }[] }

  const eventNameById = new Map((events ?? []).map((event) => [event.id, event.name]))

  const rows: RefundAdminRow[] = payments.map((payment) => ({
    payment,
    eventName: eventNameById.get(payment.event_id) ?? 'Unknown event',
  }))

  return (
    <div>
      <AdminPageHeader title="Refunds" description="Monitor pending Paystack refunds and retry failed event cancellations after verifying their status." />
      <RefundsClient rows={rows} />
    </div>
  )
}
