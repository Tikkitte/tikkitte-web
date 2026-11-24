import { parsePhoneNumberFromString } from 'libphonenumber-js/min'

export const applicationOptions = {
  organizer_type: [['venue','Venue or club'],['promoter','Promoter or collective'],['event_company','Event company'],['community','Campus, church or community group'],['artist','Artist'],['other','Other']],
  preferred_contact: [['call','Call'],['whatsapp','WhatsApp'],['instagram','Instagram DM'],['email','Email']],
} as const
export function normalizeApplicationPhone(value: string): string | null {
  const phone = parsePhoneNumberFromString(value, 'GH')
  return phone?.isValid() ? phone.number : null
}
export const INSTAGRAM_ROUTES = new Set(['p','reel','reels','stories','explore','tv','accounts','direct'])

export function normalizeInstagram(value: string): string | null {
  let handle = value.trim()
  if (!handle) return ''
  if (/^(https?:\/\/)?(www\.)?instagram\.com\//i.test(handle)) {
    try {
      const url = new URL(/^https?:\/\//i.test(handle) ? handle : `https://${handle}`)
      handle = url.pathname.split('/').filter(Boolean)[0] ?? ''
    } catch { return null }
  }
  handle = handle.replace(/^@/, '')
  return !INSTAGRAM_ROUTES.has(handle.toLowerCase()) && /^[A-Za-z0-9._]{1,30}$/.test(handle) ? `https://instagram.com/${handle}` : null
}

export type SocialNetwork = 'instagram' | 'tiktok' | 'snapchat'

const SOCIAL_PROFILES = {
  instagram: { link: /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#\s]+)/i },
  tiktok: { link: /^(?:https?:\/\/)?(?:www\.|m\.)?tiktok\.com\/@([^/?#\s]+)/i, handle: /^[A-Za-z0-9._]{2,24}$/, url: (handle: string) => `https://www.tiktok.com/@${handle}` },
  snapchat: { link: /^(?:https?:\/\/)?(?:www\.)?snapchat\.com\/(?:add\/|@)([^/?#\s]+)/i, handle: /^[A-Za-z0-9._-]{2,30}$/, url: (handle: string) => `https://www.snapchat.com/add/${handle}` },
}

// Organizers type a handle and we store the profile link. A pasted profile
// link still works, and so does a TikTok short link saved before handles.
// Returns '' when empty and null when it is not a valid handle or link.
export function normalizeSocialLink(network: SocialNetwork, value: string): string | null {
  const input = value.trim()
  if (!input) return ''
  if (network === 'instagram') return normalizeInstagram(input)
  if (network === 'tiktok' && /^https:\/\/vm\.tiktok\.com\/[A-Za-z0-9]+\/?$/i.test(input)) return input
  const profile = SOCIAL_PROFILES[network]
  const handle = (input.match(profile.link)?.[1] ?? input).replace(/^@/, '')
  return profile.handle.test(handle) ? profile.url(handle) : null
}

// The handle to show for a saved profile link, or the link itself when it
// has no handle in it (a TikTok short link).
export function socialHandle(network: SocialNetwork, savedLink: string | null | undefined): string {
  const link = savedLink?.trim() ?? ''
  const handle = link.match(SOCIAL_PROFILES[network].link)?.[1]
  return handle ? `@${handle.replace(/^@/, '')}` : link
}
