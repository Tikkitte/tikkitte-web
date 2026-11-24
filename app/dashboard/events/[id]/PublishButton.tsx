'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { computeServiceFeeMinor, serviceFeeBpsFromPercent } from '@/lib/checkout-pricing'
import ConfirmDialog from '@/components/dashboard/ConfirmDialog'

type PublishTerms = { approved: boolean; firstPublish: boolean; buyerFeePercent: number | null; platformFeePercent: number | null; termsVersion: number | null; termsAccepted: boolean }
export default function PublishButton({ eventId, published, approved }: { eventId: string; published: boolean; approved?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [terms, setTerms] = useState<PublishTerms | null>(null)
  const [accepted, setAccepted] = useState(false)
  async function readTerms() {
    const { data, error } = await createClient().rpc('get_event_publish_terms', { p_event_id: eventId })
    if (error || !data) throw new Error('Could not load your publication details. Try again.')
    if (!data.approved) throw new Error('Publishing unlocks once your account is approved.')
    return data as PublishTerms
  }
  async function toggle() {
    setLoading(true); setError(null)
    try {
      const supabase = createClient()
      if (terms && !terms.termsAccepted) {
        if (!accepted) { setError('Please accept the organizer terms.'); return }
        const { error } = await supabase.rpc('accept_organizer_terms', { p_version: terms.termsVersion })
        if (error) {
          if (error.message.includes('ERR_TERMS_VERSION_MISMATCH')) { setTerms(await readTerms()); setAccepted(false); setError('The organizer terms changed. Please review them again.'); return }
          throw new Error('Could not record your agreement. Try again.')
        }
      }
      const { data, error } = await supabase.from('event').update({ published: !published }).eq('id', eventId).select('published, ever_published').single()
      if (error || !data || data.published !== !published) {
        if (error?.message.includes('ERR_ORGANIZER_TERMS_REQUIRED')) { setTerms(await readTerms()); setAccepted(false); setError('Please review and accept the current organizer terms.'); return }
        if (error?.message.includes('ERR_ORGANIZER_NOT_APPROVED')) throw new Error('Publishing unlocks once your account is approved.')
        if (error?.message.includes('ERR_ORGANIZER_NOT_ACTIVE')) throw new Error('Your account can’t manage events. Email admin@tikkitte.com.')
        throw new Error('Could not update publication status. Try again.')
      }
      setTerms(null); setConfirming(false)
      if (!published) router.push(`/dashboard/events/${eventId}?shared=1`)
      router.refresh()
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not update publication status.') }
    finally { setLoading(false) }
  }
  async function click() {
    setError(null)
    if (published) { setConfirming(true); return }
    setLoading(true)
    try {
      const next = await readTerms()
      if (next.firstPublish) { setTerms(next); setAccepted(false) }
      else { setLoading(false); await toggle() }
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load publication details.') }
    finally { setLoading(false) }
  }
  const buyer = terms?.buyerFeePercent
  const platform = terms?.platformFeePercent
  const buyerTotal = buyer == null ? null : 100 + computeServiceFeeMinor(10000, serviceFeeBpsFromPercent(buyer)) / 100
  return <div className="shrink-0">
    <button type="button" onClick={click} disabled={loading || (!published && approved !== true)} className={`create-focus min-h-11 rounded-full px-6 text-sm font-semibold disabled:opacity-50 ${published ? 'border border-gray-300 bg-white' : 'bg-[#2766d2] text-white'}`}>{loading ? 'Working…' : published ? 'Unpublish' : 'Publish event'}</button>
    {!published && approved !== true && <p className="mt-2 max-w-xs text-xs text-gray-500">Publishing unlocks once your account is approved.</p>}
    {error && !confirming && !terms && <p role="alert" className="mt-2 max-w-xs text-xs text-red-600">{error}</p>}
    <ConfirmDialog open={confirming} title="Unpublish this event?" description="The public event page and checkout will stop working until you publish again. Already-sold tickets and bookings are not affected." confirmLabel="Unpublish" loading={loading} error={error} onConfirm={toggle} onCancel={() => { setConfirming(false); setError(null) }} danger />
    {terms && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section role="dialog" aria-modal="true" aria-labelledby="publish-heading" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <h2 id="publish-heading" className="text-xl font-bold">Publish your event</h2>
      <p className="mt-4 text-sm">Service fee: {buyer == null ? 'unconfirmed' : `${buyer}%`} (paid by buyers). Platform fee: {platform == null ? 'unconfirmed' : `${platform}%`} (deducted from your sales).</p>
      {buyerTotal != null && platform != null ? <p className="mt-3 rounded-xl bg-gray-50 p-3 text-sm">For a GHS 100 ticket, your buyer pays GHS {buyerTotal.toFixed(2)} and you receive GHS {(100 - platform).toFixed(2)}.</p> : <p className="mt-3 text-sm">Email admin@tikkitte.com to confirm your fees.</p>}
      <p className="mt-3 text-sm text-gray-600">Ticket types can’t be deleted after you publish. You can still edit them.</p>
      <p className="mt-4 text-sm text-gray-600">Request a payout from your event page. Payouts arrive within 3 to 5 business days to your MoMo or bank account.</p>
      {!terms.termsAccepted && <label className="mt-5 flex items-start gap-2 text-sm"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-1" /><span>I agree to the <a href="/organizer-terms" target="_blank" rel="noopener noreferrer" className="underline">Tikkitte organizer terms</a>.</span></label>}
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={loading} onClick={() => { setTerms(null); setError(null) }} className="rounded-full border px-4 py-2 text-sm">Cancel</button><button type="button" disabled={loading || (!terms.termsAccepted && !accepted)} onClick={toggle} className="rounded-full bg-[#2766d2] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? 'Publishing…' : 'Publish event'}</button></div>
    </section></div>}
  </div>
}
