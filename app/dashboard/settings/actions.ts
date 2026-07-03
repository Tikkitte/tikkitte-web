'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type UpdateOrganizerProfileInput = {
  displayName: string
  bio: string
  logoUrl: string
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
    typeof input.logoUrl !== 'string'
  ) {
    return null
  }

  return {
    displayName: input.displayName,
    bio: input.bio,
    logoUrl: input.logoUrl,
  }
}

function normalizeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    return url.toString()
  } catch {
    return undefined
  }
}

export async function updateOrganizerProfile(
  input: unknown
): Promise<UpdateOrganizerProfileResult> {
  const parsed = parseInput(input)
  if (!parsed) {
    return { ok: false, message: 'Invalid profile details.' }
  }

  const displayName = parsed.displayName.trim()
  const bio = parsed.bio.trim()
  const logoUrl = normalizeUrl(parsed.logoUrl)

  if (displayName.length < 1 || displayName.length > 80) {
    return { ok: false, message: 'Display name must be between 1 and 80 characters.' }
  }

  if (bio.length > 500) {
    return { ok: false, message: 'Bio must be 500 characters or fewer.' }
  }

  if (logoUrl === undefined) {
    return { ok: false, message: 'Logo URL must be a valid http or https URL.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { ok: false, message: 'You must be signed in to update your profile.' }
  }

  const { data: updatedProfile, error } = await supabase
    .from('organizer_profile')
    .update({
      display_name: displayName,
      bio: bio || null,
      logo_url: logoUrl,
    })
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
