'use client'

import { useState } from 'react'
import SendCampaignModal from './SendCampaignModal'

export type MarketingEvent = {
  id: string
  name: string
  date: string
  last_alert_sent_at: string | null
  recipientCount: number
}

type Props = {
  events: MarketingEvent[]
  totalFans: number
  lastBroadcastSentAt: string | null
}

type ActiveCampaign =
  | { mode: 'event'; eventId: string; eventName: string; lastAlertSentAt: string | null }
  | { mode: 'broadcast' }

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return 'TBA'
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

const messageButtonClass = 'create-focus min-h-10 rounded-full border border-[var(--tikkitte-cream-border)] bg-white px-5 text-sm font-semibold text-[#2565d0] transition-colors hover:border-[#b9cff5] hover:bg-[#f4f7fd] disabled:cursor-not-allowed disabled:text-[var(--tikkitte-ink-faint)] disabled:opacity-50'

export default function MarketingClient({ events, totalFans, lastBroadcastSentAt }: Props) {
  const [activeCampaign, setActiveCampaign] = useState<ActiveCampaign | null>(null)

  return (
    <>
      <div className="create-card overflow-hidden">
        <div className="border-b border-[var(--tikkitte-cream-border)] px-5 py-4">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--tikkitte-ink-soft)]">Messaging lists</h2>
          <p className="mt-1 text-xs text-[var(--tikkitte-ink-faint)]">Send an update to one event’s buyers or your full audience.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-[var(--tikkitte-cream-border)] text-[10.5px] uppercase tracking-[0.09em] text-[var(--tikkitte-ink-faint)]">
                <th className="px-5 py-3 text-left font-bold">Name</th>
                <th className="px-5 py-3 text-left font-bold">Type</th>
                <th className="px-5 py-3 text-right font-bold">Recipients</th>
                <th className="px-5 py-3 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-[var(--tikkitte-ink-faint)]">
                    Create an event to start building messaging lists.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="border-b border-[var(--tikkitte-cream-border)] transition-colors last:border-0 hover:bg-[var(--tikkitte-cream)]">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-[var(--tikkitte-ink)]">{event.name}</p>
                      <p className="mt-0.5 text-xs text-[var(--tikkitte-ink-faint)]">{formatDate(event.date)}</p>
                    </td>
                    <td className="px-5 py-3 text-[var(--tikkitte-ink-soft)]">From tickets</td>
                    <td className="px-5 py-3 text-right font-semibold">{event.recipientCount}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveCampaign({ mode: 'event', eventId: event.id, eventName: event.name, lastAlertSentAt: event.last_alert_sent_at })}
                        className={messageButtonClass}
                      >
                        Message
                      </button>
                    </td>
                  </tr>
                ))
              )}

              <tr className="bg-[var(--tikkitte-cream)]">
                <td className="px-5 py-3 font-semibold">All fans</td>
                <td className="px-5 py-3 text-[var(--tikkitte-ink-soft)]">All events</td>
                <td className="px-5 py-3 text-right font-semibold">{totalFans}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setActiveCampaign({ mode: 'broadcast' })}
                    disabled={totalFans === 0}
                    title={totalFans === 0 ? 'No fans to message yet' : undefined}
                    className={messageButtonClass}
                  >
                    Message
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {activeCampaign?.mode === 'event' && (
        <SendCampaignModal
          mode="event"
          eventId={activeCampaign.eventId}
          eventName={activeCampaign.eventName}
          lastAlertSentAt={activeCampaign.lastAlertSentAt}
          onClose={() => setActiveCampaign(null)}
        />
      )}

      {activeCampaign?.mode === 'broadcast' && (
        <SendCampaignModal
          mode="broadcast"
          lastAlertSentAt={lastBroadcastSentAt}
          onClose={() => setActiveCampaign(null)}
        />
      )}
    </>
  )
}
