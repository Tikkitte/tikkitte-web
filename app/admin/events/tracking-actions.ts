'use server'

import { createClient } from '@/lib/supabase/server'

export type AdminLinkSales = { orders: number; tickets: number; revenueCents: number }

export type AdminTrackingLink = AdminLinkSales & {
  id: string
  name: string
  slug: string
  clicks: number
  createdAt: string
}

export type AdminCreditedOrder = {
  reference: string
  linkId: string
  soldAt: string
  creditedAt: string
  tickets: number
  revenueCents: number
}

export type AdminEventTrackingLinks = {
  links: AdminTrackingLink[]
  unattributed: AdminLinkSales
  creditedOrderCount: number
  recentOrders: AdminCreditedOrder[]
}

export async function getEventTrackingLinks(eventId: string): Promise<
  { ok: true; data: AdminEventTrackingLinks } | { ok: false; message: string }
> {
  if (typeof eventId !== 'string' || !eventId.trim() || eventId.trim().length > 200) {
    return { ok: false, message: 'Invalid event.' }
  }

  try {
    // The RPC itself refuses anyone who is not in admin_user.
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('admin_get_event_tracking_links', { p_event_id: eventId.trim() })
    if (error || !data) {
      if (error?.code === '42501') return { ok: false, message: 'Not authorized.' }
      if (error?.code === 'P0002') return { ok: false, message: 'Event not found.' }
      return { ok: false, message: 'Could not load tracking links. Please try again.' }
    }
    return { ok: true, data: data as AdminEventTrackingLinks }
  } catch {
    return { ok: false, message: 'Could not load tracking links. Please try again.' }
  }
}
