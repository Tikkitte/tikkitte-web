import PosterFrame from '@/components/PosterFrame'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Nav from '@/components/landing/Nav'
import Footer from '@/components/landing/Footer'
import { formatDate } from '@/lib/format'

export const revalidate = 30

type Organizer = {
  id: string
  display_name: string
  bio: string | null
  logo_url: string | null
  tiktok_url: string | null
  instagram_url: string | null
  snapchat_url: string | null
}

type OrganizerEvent = {
  id: string
  name: string
  slug: string | null
  date: string
  image: string[] | null
  venue: string | null
}

function initialFor(name: string) {
  return name.trim()[0]?.toUpperCase() ?? 'T'
}

function TikTokIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3v11.5a4.5 4.5 0 1 1-4.5-4.5" />
      <path d="M14 5a6 6 0 0 0 6 6" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M17.5 6.5h.01" />
    </svg>
  )
}

function SnapchatIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3c-2.6 0-4.5 2-4.5 4.7v2.1c0 1.1-.7 2.1-1.8 2.6l-1.2.5c.5 1.2 1.7 1.9 3.1 2 .5 1.5 1.9 2.6 4.4 2.6s3.9-1.1 4.4-2.6c1.4-.1 2.6-.8 3.1-2l-1.2-.5c-1.1-.5-1.8-1.5-1.8-2.6V7.7C16.5 5 14.6 3 12 3Z" />
    </svg>
  )
}

export default async function OrganizerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: organizer } = await supabase
    .from('organizer_profile')
    .select('id, display_name, bio, logo_url, tiktok_url, instagram_url, snapchat_url')
    .eq('slug', slug)
    .eq('approved', true)
    .maybeSingle()

  if (!organizer) notFound()

  const today = new Date().toISOString().slice(0, 10)

  const { data: events } = await supabase
    .from('event')
    .select('id, name, slug, date, image, venue')
    .eq('organizer_id', organizer.id)
    .eq('published', true)
    .eq('cancelled', false)
    .gte('date', today)
    .order('date', { ascending: true })

  const organizerProfile = organizer as Organizer
  const organizerEvents = (events ?? []) as OrganizerEvent[]

  return (
    <main className="flex min-h-screen flex-col bg-[#F4F2EC] font-grotesk text-[#191917]">
      <Nav />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-12 rounded-[28px] border border-[#E4DFD1] bg-white p-[clamp(28px,5vw,56px)] shadow-[0_24px_70px_rgba(25,25,23,0.06)]">
          <div className="mb-5">
            {organizerProfile.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={organizerProfile.logo_url}
                alt=""
                className="h-20 w-20 rounded-full border border-[#E4DFD1] object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2565D0]/10 text-3xl font-bold text-[#2565D0]">
                {initialFor(organizerProfile.display_name)}
              </div>
            )}
          </div>
          <div className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#2565D0]">Organizer</div>
          <h1 className="mt-3 font-anton font-normal text-[clamp(42px,7vw,86px)] uppercase leading-[0.98] text-[#191917]">{organizerProfile.display_name}</h1>
          {organizerProfile.bio && (
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#5F5D54]">{organizerProfile.bio}</p>
          )}
          {(organizerProfile.tiktok_url || organizerProfile.instagram_url || organizerProfile.snapchat_url) && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {organizerProfile.tiktok_url && (
                <a
                  href={organizerProfile.tiktok_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-[#C8C3B2] px-4 py-2 text-xs font-semibold text-[#5F5D54] transition-colors hover:border-[#2565D0] hover:text-[#2565D0]"
                >
                  <TikTokIcon />
                  TikTok
                </a>
              )}
              {organizerProfile.instagram_url && (
                <a
                  href={organizerProfile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-[#C8C3B2] px-4 py-2 text-xs font-semibold text-[#5F5D54] transition-colors hover:border-[#2565D0] hover:text-[#2565D0]"
                >
                  <InstagramIcon />
                  Instagram
                </a>
              )}
              {organizerProfile.snapchat_url && (
                <a
                  href={organizerProfile.snapchat_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-[#C8C3B2] px-4 py-2 text-xs font-semibold text-[#5F5D54] transition-colors hover:border-[#2565D0] hover:text-[#2565D0]"
                >
                  <SnapchatIcon />
                  Snapchat
                </a>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[13px] font-bold uppercase tracking-[0.16em] text-[#2565D0]">Upcoming events</div>
              <h2 className="mt-2 font-anton font-normal text-[clamp(34px,5vw,58px)] uppercase leading-[1.02] text-[#191917]">What&apos;s next</h2>
            </div>
            <Link href="/events" className="rounded-full border border-[#C8C3B2] px-5 py-2.5 text-sm font-semibold text-[#191917] transition-colors hover:border-[#191917]">
              Browse all events
            </Link>
          </div>
          {organizerEvents.length === 0 ? (
            <div className="rounded-[24px] border border-[#E4DFD1] bg-white px-6 py-14 text-center">
              <p className="text-sm text-[#5F5D54]">No upcoming events right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {organizerEvents.map((event) => {
                const poster = event.image?.[0]
                return (
                  <Link
                    key={event.id}
                    href={`/e/${event.slug ?? event.id}`}
                    className="overflow-hidden rounded-[20px] border border-[#E4DFD1] bg-white transition-colors hover:border-[#2565D0]"
                  >
                    <div className="relative aspect-[4/5] bg-[#ECE7D8]">
                      {poster ? (
                        <div className="absolute inset-0">
                          <PosterFrame src={poster} alt={event.name} sizes="(max-width: 1024px) 100vw, 33vw" className="h-full w-full" />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#C8C3B2]" aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="line-clamp-1 font-anton font-normal text-2xl uppercase leading-[1.05] text-[#191917]">{event.name}</h3>
                      <p className="mt-2 text-sm font-semibold text-[#2565D0]">{formatDate(event.date)}</p>
                      <p className="mt-1 line-clamp-1 text-sm text-[#5F5D54]">{event.venue ?? 'No venue'}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </div>
      <Footer />
    </main>
  )
}
