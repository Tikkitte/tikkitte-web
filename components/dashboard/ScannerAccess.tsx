'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ScannerAccess({ eventId }: { eventId: string }) {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    Promise.resolve(createClient().rpc('manage_scanner_access', { p_event_id: eventId, p_action: 'status' }))
      .then(({ data, error }) => {
        if (!active) return
        if (error || !data) setMessage('Could not load scanner access. Reload to try again.')
        else setEnabled(Boolean(data.enabled))
      })
      .catch(() => {
        if (active) setMessage('Could not load scanner access. Reload to try again.')
      })
    return () => { active = false }
  }, [eventId])

  async function update(action: 'rotate' | 'revoke') {
    setBusy(true)
    setMessage('')
    try {
      const { data, error } = await createClient().rpc('manage_scanner_access', {
        p_event_id: eventId, p_action: action,
      })
      if (error || !data) throw new Error('save_failed')
      setEnabled(Boolean(data.enabled))
      setCode(data.code ?? '')
      setMessage(action === 'revoke' ? 'Scanner access disabled.' : 'Code is active. Copy it now; it is shown only once.')
    } catch {
      setMessage('Could not update scanner access. Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function copy(link = false) {
    try {
      const formatted=code.match(/.{1,4}/g)!.join('-')
      await navigator.clipboard.writeText(link ? `${window.location.origin}/scan#code=${formatted}` : formatted)
      setMessage(`Scanner ${link ? 'link' : 'code'} copied. Share it only with door staff.`)
    } catch {
      setMessage('Could not copy. Select and copy the code above.')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold text-gray-900">Scanner access</h2>
      <p className="text-xs text-gray-500">
        {enabled === null ? 'Loading scanner access…' : enabled ? 'A scanner code is active.' : 'No scanner code is active.'}{' '}
        Give your code to door staff for <a href="/scan" target="_blank" rel="noopener noreferrer" className="underline">tikkitte.com/scan</a>.
        {' '}Sessions last 24 hours. Regenerating or disabling access immediately ends existing sessions. Offline devices must reconnect to receive changes.
      </p>
      {code && <p className="select-all break-all rounded-lg bg-gray-50 p-3 font-mono text-lg text-gray-900">{code.match(/.{1,4}/g)!.join('-')}</p>}
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy || enabled === null} onClick={() => update('rotate')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium disabled:opacity-50">
          {busy ? 'Updating…' : enabled ? 'Regenerate code' : 'Generate code'}
        </button>
        {code && <button type="button" onClick={() => copy()} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Copy code</button>}
        {code && <button type="button" onClick={() => copy(true)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm">Copy link</button>}
        {enabled && <button type="button" disabled={busy} onClick={() => update('revoke')} className="px-3 py-2 text-sm text-red-600 disabled:opacity-50">Disable access</button>}
      </div>
      {message && <p role="status" className="text-xs text-gray-600">{message}</p>}
    </div>
  )
}
