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
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return 'TBA'
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

const messageButtonClass = 'rounded-lg border border-[#1d67ba] px-4 py-2 text-sm font-semibold text-[#1d67ba] transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent'

export default function MarketingClient({ events, totalFans }: Props) {
  const [activeEvent, setActiveEvent] = useState<MarketingEvent | null>(null)

  return (
    <>
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Messaging lists</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Type</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Recipients</th>
                <th className="px-5 py-3 text-right font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm text-gray-400">
                    Create an event to start building messaging lists.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900">{event.name}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{formatDate(event.date)}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">From tickets</td>
                    <td className="px-5 py-3 text-right font-semibold text-gray-900">{event.recipientCount}</td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveEvent(event)}
                        className={messageButtonClass}
                      >
                        Message
                      </button>
                    </td>
                  </tr>
                ))
              )}

              <tr className="border-t border-gray-100">
                <td className="px-5 py-3 font-medium text-gray-900">All fans</td>
                <td className="px-5 py-3 text-gray-600">All events</td>
                <td className="px-5 py-3 text-right font-semibold text-gray-900">{totalFans}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    disabled
                    title="Cross-event messaging coming soon"
                    className={messageButtonClass}
                  >
                    Message ↗
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {activeEvent && (
        <SendCampaignModal
          eventId={activeEvent.id}
          eventName={activeEvent.name}
          lastAlertSentAt={activeEvent.last_alert_sent_at}
          onClose={() => setActiveEvent(null)}
        />
      )}
    </>
  )
}
