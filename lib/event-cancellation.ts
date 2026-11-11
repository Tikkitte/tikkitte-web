import type { Event } from './types'

export function isCancelledForOrganizer(event: Pick<Event, 'cancelled' | 'cancellation_requested_at'>) {
  return event.cancelled || event.cancellation_requested_at != null
}
