import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteUrl) {
    return []
  }

  const supabase = await createClient()
  const { data: events } = await supabase
    .from('event')
    .select('id, date')
    .eq('cancelled', false)
    .order('date', { ascending: true })

  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/events',
    '/organizers',
    '/about',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.8,
  }))

  const eventRoutes: MetadataRoute.Sitemap = (events ?? []).map((event) => ({
    url: `${siteUrl}/e/${event.id}`,
    lastModified: event.date ? new Date(event.date) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...eventRoutes]
}
