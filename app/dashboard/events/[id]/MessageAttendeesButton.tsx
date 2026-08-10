'use client'

import { useMemo, useState, useTransition } from 'react'
import { sendEventAlert } from './actions'

type Props = {
  eventId: string
  lastAlertSentAt: string | null
  attendeeCount: number
}

const inputClass = 'w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3d3d] placeholder:text-gray-400'

function formatDateTime(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function MessageAttendeesButton({ eventId, lastAlertSentAt, attendeeCount }: Props) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [nextAvailableAt, setNextAvailableAt] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const initialNextAvailableAt = useMemo(() => {
    if (!lastAlertSentAt) return null
    const next = new Date(new Date(lastAlertSentAt).getTime() + 24 * 60 * 60 * 1000)
    return next > new Date() ? next.toISOString() : null
  }, [lastAlertSentAt])

  const effectiveNextAvailableAt = nextAvailableAt ?? initialNextAvailableAt
  const sendDisabled = Boolean(effectiveNextAvailableAt) || isPending || !subject.trim() || !body.trim()

  const close = () => {
    setOpen(false)
    setError(null)
    setSuccess(null)
  }

  const handleSend = () => {
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result = await sendEventAlert({ eventId, subject, body })
      if (!result.ok) {
        setError(result.message)
        setNextAvailableAt(result.nextAvailableAt ?? null)
        return
      }

      setSuccess(`Sent to ${result.sentCount} attendee${result.sentCount === 1 ? '' : 's'}.`)
      setSubject('')
      setBody('')
      window.setTimeout(() => close(), 2000)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-[#3d3d3d] text-[#3d3d3d] text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="hidden sm:inline">Message attendees</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Message your attendees</h2>
                <p className="mt-1 text-sm text-gray-500">Will be sent to all paid and free ticket holders for this event. Complimentary ticket recipients are not messaged.</p>
              </div>
              <button type="button" onClick={close} className="text-gray-400 hover:text-gray-600" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-[#3d3d3d]">
              You can send one attendee message per event every 24 hours.
            </div>

            {effectiveNextAvailableAt && (
              <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Next message available at {formatDateTime(effectiveNextAvailableAt)}.
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  maxLength={200}
                  className={inputClass}
                  placeholder="Important update for your event"
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <span className="text-xs text-gray-400">{body.length}/2000</span>
                </div>
                <textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  maxLength={2000}
                  rows={5}
                  className={inputClass}
                  placeholder="Write your attendee update..."
                />
              </div>
              <p className="text-xs text-gray-400">
                Current dashboard count: {attendeeCount} attendee{attendeeCount === 1 ? '' : 's'}.
              </p>
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            {success && <p className="mt-4 text-sm text-green-600">{success}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={close}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sendDisabled}
                className="rounded-lg bg-[#3d3d3d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2a2a2a] disabled:opacity-60"
              >
                {isPending ? 'Sending...' : 'Send message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
