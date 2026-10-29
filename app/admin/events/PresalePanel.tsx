'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { addPresaleEmails, getEventPresale, listPresaleEntries, removePresaleEmail, saveEventPresale, sendPresaleInvites } from './actions'
import type { EventPresale, PresaleEntry } from './presale-types'

const buttonClass = 'create-focus min-h-11 rounded-full border border-[var(--tikkitte-cream-border)] px-4 text-xs font-semibold hover:bg-white disabled:opacity-45'

export default function PresalePanel({ eventId }: { eventId: string }) {
  const router = useRouter()
  const [data, setData] = useState<EventPresale | null>(null)
  const [entries, setEntries] = useState<PresaleEntry[]>([])
  const [listed, setListed] = useState(true)
  const [max, setMax] = useState('2')
  const [ticketIds, setTicketIds] = useState<string[]>([])
  const [rawText, setRawText] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)
  const searchSequence = useRef(0)

  const reload = useCallback(async () => {
    const [settings, list] = await Promise.all([getEventPresale(eventId), listPresaleEntries(eventId, search)])
    if (!settings.ok) { setError(settings.message); return }
    setData(settings.data)
    if (list.ok) setEntries(list.data)
    else setError(list.message)
  }, [eventId, search])

  useEffect(() => {
    let active = true
    Promise.all([getEventPresale(eventId), listPresaleEntries(eventId)]).then(([settings, list]) => {
      if (!active) return
      setLoading(false)
      if (!settings.ok) { setError(settings.message); return }
      setData(settings.data)
      setListed(settings.data.listed)
      setMax(String(settings.data.maxPerEmail))
      setTicketIds(settings.data.tickets.filter((ticket) => ticket.presaleOnly).map((ticket) => ticket.id))
      if (list.ok) setEntries(list.data)
      else setError(list.message)
    })
    return () => { active = false }
  }, [eventId])

  useEffect(() => {
    let active = true
    const sequence = ++searchSequence.current
    const timer = setTimeout(async () => {
      const result = await listPresaleEntries(eventId, search)
      if (!active || sequence !== searchSequence.current) return
      if (result.ok) setEntries(result.data)
      else setError(result.message)
    }, 300)
    return () => { active = false; clearTimeout(timer) }
  }, [eventId, search])

  const save = () => {
    setError(null)
    setNotice(null)
    startTransition(async () => {
      const result = await saveEventPresale(eventId, { listed, maxPerEmail: Number(max), presaleTicketIds: ticketIds })
      if (!result.ok) { setError(result.message); return }
      setNotice('Early bird settings saved.')
      await reload()
      router.refresh()
    })
  }

  const add = () => {
    setError(null)
    setNotice(null)
    startTransition(async () => {
      const result = await addPresaleEmails(eventId, rawText)
      if (!result.ok) { setError(result.message); await reload(); return }
      const { added, alreadyListed, invalidCount, invalid } = result.data
      setNotice(`Added ${added}. ${alreadyListed} already on the list. ${invalidCount} invalid${invalid.length ? `: ${invalid.slice(0, 5).join(', ')}` : '.'}`)
      setRawText('')
      await reload()
    })
  }

  const remove = (email: string) => {
    setError(null)
    setNotice(null)
    startTransition(async () => {
      const result = await removePresaleEmail(eventId, email)
      if (!result.ok) { setError(result.message); return }
      if (result.data === 'in_use') setError('This email has a checkout open or has already bought early bird tickets and cannot be removed.')
      else setNotice(result.data === 'removed' ? 'Email removed.' : 'Email is no longer on the list.')
      await reload()
    })
  }

  const sendInvites = () => {
    setError(null)
    setNotice(null)
    startTransition(async () => {
      const result = await sendPresaleInvites(eventId)
      if (!result.ok) { setError(result.message); return }
      setNotice(result.queued === 0
        ? 'Everyone on the list has already been emailed.'
        : `Sending the link to ${result.queued} ${result.queued === 1 ? 'email' : 'emails'}. Refresh in a minute to see them marked as emailed.`)
      await reload()
    })
  }

  const notInvited = data ? data.entryCount - data.invitedCount : 0
  const shareLink = `https://tikkitte.com/e/${data?.slug ?? eventId}`
  return (
    <section aria-label="Early bird settings" className="create-card mt-4 space-y-5 rounded-2xl bg-[var(--tikkitte-cream)] p-4 text-sm">
      {loading && <p role="status">Loading early bird settings…</p>}
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {notice && <p role="status" className="text-[#2565d0]">{notice}</p>}
      {data && <>
        <div className="flex flex-wrap items-center gap-2">
          <a href={shareLink} className="create-focus break-all text-[#2565d0]" target="_blank" rel="noreferrer">{shareLink}</a>
          <button type="button" className={buttonClass} onClick={async () => {
            try { await navigator.clipboard.writeText(shareLink); setNotice('Link copied.') }
            catch { setError('Could not copy the link. Select and copy it above.') }
          }}>Copy</button>
        </div>
        <fieldset disabled={pending} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={listed} onChange={(e) => setListed(e.target.checked)} />Show on browse events and the organizer page</label>
            <p className="mt-1 text-xs text-[var(--tikkitte-ink-soft)]">When off, only people with the link can find this event.</p>
          </div>
          <div className="space-y-3">
            {data.tickets.map((ticket) => <label key={ticket.id} className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={ticketIds.includes(ticket.id)} onChange={(e) => setTicketIds((ids) => e.target.checked ? [...ids, ticket.id] : ids.filter((id) => id !== ticket.id))} />
              <span><span className="font-semibold">{ticket.label} · GH₵ {Number(ticket.price).toFixed(2)}</span><span className="block text-xs">Early bird list only</span><span className="block text-xs text-[var(--tikkitte-ink-soft)]">{ticket.saleStartDate ?? 'No start date'} to {ticket.saleEndDate ?? 'No end date'}</span></span>
            </label>)}
          </div>
          <label className="block"><span className="mb-1 block font-semibold">Max early bird tickets per email</span><input type="number" min={1} max={10} value={max} onChange={(e) => setMax(e.target.value)} className="create-input create-focus min-h-11 w-24 rounded-xl px-3" /></label>
          <button type="button" onClick={save} className={`${buttonClass} bg-[#191917] text-white hover:bg-black`}>{pending ? 'Saving…' : 'Save early bird settings'}</button>
        </fieldset>
        <p>{data.entryCount} emails on the list · {data.usedCount} bought · {data.pendingCount} checkouts open</p>
        <div className="space-y-2">
          <p>{data.invitedCount} emailed the link · {notInvited} not emailed yet{data.inviteFailedCount > 0 ? ` (${data.inviteFailedCount} failed)` : ''}</p>
          <p className="text-xs text-[var(--tikkitte-ink-soft)]">
            {data.published
              ? 'Everyone on the list was emailed the link when the event was published. Use the button for emails added since then, or to retry failed ones.'
              : 'Everyone on the list is emailed the link automatically when the event is published.'}
          </p>
          {data.published && !data.cancelled && notInvited > 0 && (
            <button type="button" disabled={pending} onClick={sendInvites} className={buttonClass}>
              Email the link to {notInvited} {notInvited === 1 ? 'person' : 'people'}
            </button>
          )}
        </div>
        {ticketIds.length > 0 && data.entryCount === 0 && <p className="font-medium text-[#765400]">No one can buy early bird tickets until you add emails.</p>}
        <div>
          <label className="block"><span className="mb-2 block font-semibold">Paste emails (one per line, or a CSV column)</span><textarea value={rawText} onChange={(e) => setRawText(e.target.value)} rows={4} className="create-input create-focus w-full rounded-xl p-3" /></label>
          <button type="button" disabled={pending || !rawText.trim()} onClick={add} className={`${buttonClass} mt-2`}>Add to list</button>
        </div>
        <label className="block"><span className="mb-2 block font-semibold">Search emails</span><input type="search" maxLength={254} value={search} onChange={(e) => setSearch(e.target.value)} className="create-input create-focus min-h-11 w-full rounded-xl px-3" /></label>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs"><thead><tr>{['Email', 'Status', 'Emailed', 'Reference', ''].map((heading) => <th key={heading} className="px-2 py-2">{heading}</th>)}</tr></thead>
            <tbody>{entries.map((entry) => <tr key={entry.email} className="border-t border-[var(--tikkitte-cream-border)]">
              <td className="px-2 py-2">{entry.email}</td><td className="px-2 py-2">{{ available: 'Available', pending: 'Checkout open', used: 'Bought' }[entry.status]}</td><td className="px-2 py-2" title={entry.inviteError ?? undefined}>{entry.invitedAt ? new Date(entry.invitedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : entry.inviteError ? 'Failed' : 'Not yet'}</td><td className="px-2 py-2">{entry.reference ?? ''}</td>
              <td className="px-2 py-2">{entry.status === 'available' ? <button type="button" disabled={pending} onClick={() => remove(entry.email)} className={buttonClass} aria-label={`Remove ${entry.email}`}>Remove</button> : <span className="text-[var(--tikkitte-ink-soft)]">In use, cannot remove</span>}</td>
            </tr>)}</tbody>
          </table>
          {entries.length === 0 && <p className="py-4 text-[var(--tikkitte-ink-soft)]">No matching emails.</p>}
          {entries.length === 50 && <p className="mt-2 text-xs">Showing the first 50 matches. Search to narrow the list.</p>}
        </div>
      </>}
    </section>
  )
}
