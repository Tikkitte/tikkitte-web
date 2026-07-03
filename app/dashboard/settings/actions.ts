'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type UpdateOrganizerProfileInput = {
  displayName: string
  bio: string
  tiktokUrl: string
  instagramUrl: string
  snapchatUrl: string
  logoUrl?: string | null
}

type UpdateOrganizerProfileResult = { ok: true } | { ok: false; message: string }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseInput(input: unknown): UpdateOrganizerProfileInput | null {
  if (!isRecord(input)) return null
  if (
    typeof input.displayName !== 'string' ||
    typeof input.bio !== 'string' ||
    typeof input.tiktokUrl !== 'string' ||
    typeof input.instagramUrl !== 'string' ||
    typeof input.snapchatUrl !== 'string'
  ) {
    return null
  }

  if ('logoUrl' in input) {
    if (typeof input.logoUrl !== 'string' && input.logoUrl !== null) return null
    return {
      displayName: input.displayName,
      bio: input.bio,
      tiktokUrl: input.tiktokUrl,
      instagramUrl: input.instagramUrl,
      snapchatUrl: input.snapchatUrl,
      logoUrl: input.logoUrl,
    }
  }

  return {
    displayName: input.displayName,
    bio: input.bio,
    tiktokUrl: input.tiktokUrl,
    instagramUrl: input.instagramUrl,
    snapchatUrl: input.snapchatUrl,
  }
}

const tiktokPattern = /^https:\/\/((www\.)?tiktok\.com\/@|vm\.tiktok\.com\/)/
const instagramPattern = /^https:\/\/(www\.)?instagram\.com\//
const snapchatPattern = /^https:\/\/(www\.)?snapchat\.com\/add\//
const urlPattern = /^https?:\/\//

export async function updateOrganizerProfile(
  input: unknown
): Promise<UpdateOrganizerProfileResult> {
  const parsed = parseInput(input)
  if (!parsed) {
    return { ok: false, message: 'Invalid profile details.' }
  }

  const displayName = parsed.displayName.trim()
  const bio = parsed.bio.trim()
  const tiktokUrl = parsed.tiktokUrl.trim()
  const instagramUrl = parsed.instagramUrl.trim()
  const snapchatUrl = parsed.snapchatUrl.trim()

  if (displayName.length < 1 || displayName.length > 80) {
    return { ok: false, message: 'Display name must be between 1 and 80 characters.' }
  }

  if (bio.length > 500) {
    return { ok: false, message: 'Bio must be 500 characters or fewer.' }
  }
  if (tiktokUrl && !tiktokPattern.test(tiktokUrl)) {
    return { ok: false, message: 'Enter a valid TikTok profile URL.' }
  }
  if (instagramUrl && !instagramPattern.test(instagramUrl)) {
    return { ok: false, message: 'Enter a valid Instagram profile URL.' }
  }
  if (snapchatUrl && !snapchatPattern.test(snapchatUrl)) {
    return { ok: false, message: 'Enter a valid Snapchat add URL.' }
  }
  if (typeof parsed.logoUrl === 'string' && !urlPattern.test(parsed.logoUrl)) {
    return { ok: false, message: 'Profile photo URL is invalid.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: 'You must be signed in to update your profile.' }
  }

  const updatePayload: {
    display_name: string
    bio: string | null
    tiktok_url: string | null
    instagram_url: string | null
    snapchat_url: string | null
    logo_url?: string | null
  } = {
    display_name: displayName,
    bio: bio || null,
    tiktok_url: tiktokUrl || null,
    instagram_url: instagramUrl || null,
    snapchat_url: snapchatUrl || null,
  }

  if ('logoUrl' in parsed) {
    updatePayload.logo_url = parsed.logoUrl
  }

  const { data: updatedProfile, error } = await supabase
    .from('organizer_profile')
    .update(updatePayload)
    .eq('id', user.id)
    .select('id')
    .maybeSingle()

  if (error || !updatedProfile) {
    return { ok: false, message: 'Could not save changes. Please try again.' }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/dashboard')
  return { ok: true }
}
