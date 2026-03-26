import Link from 'next/link'
import type { Event } from '@/lib/types'

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[m - 1]} ${d}, ${y}`
}

type Props = {
  events: Event[]
}

export default function EventGrid({ events }: Props) {
  if (events.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 dark:text-slate-500">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No upcoming events right now</h2>
        <p className="text-gray-500 dark:text-slate-400 text-sm">Check back soon — new events are added all the time.</p>
      </section>
    )
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-10">
      <h2 className="text-xs font-bold text-[#1d67ba] uppercase tracking-widest mb-6">Upcoming Events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((event) => {
          const poster = event.image?.[0]
          const href = `/e/${event.slug ?? event.id}`

          return (
            <Link
              key={event.id}
              href={href}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-shadow group"
            >
              <div className="relative h-44 bg-gray-100 dark:bg-slate-800">
                {poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={poster} alt={event.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 dark:text-slate-600">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-1">{event.name}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-300">{formatDate(event.date)}</p>
                {event.venue && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-1">{event.venue}</p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
