import type { PostgrestError } from '@supabase/supabase-js'
import type { createClient } from '@/lib/supabase/client'

type BrowserSupabase = ReturnType<typeof createClient>

const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1'

async function notifyOrganizerWelcome(supabase: BrowserSupabase) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    if (!accessToken) return
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/send-organizer-welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (!res.ok) {
      console.error('[organizer-profile] send-organizer-welcome failed', res.status, await res.text())
    }
  } catch (err) {
    console.error('[organizer-profile] send-organizer-welcome invoke failed', err)
  }
}

function isSlugClash(error: PostgrestError) {
  return error.code === '23505' && error.message.includes('organizer_profile_slug_key')
}

// Creates the signed-in user's organizer_profile row (pending approval) if it
// does not exist yet, then sends the welcome email. Safe to call repeatedly:
// an existing row is left alone and the welcome email is sent once server side
// (welcome_email_sent_at marker).
//
// The database assigns the slug (20261107120000_organizer_slug_assignment.sql),
// so none is sent. The browser cannot choose one reliably: RLS hides
// unapproved organizers, so their slugs look free from here.
export async function ensureOrganizerProfile(
  supabase: BrowserSupabase,
  profile: { id: string; displayName: string; email: string }
): Promise<{ error: PostgrestError | null }> {
  const row = { id: profile.id, display_name: profile.displayName.trim(), email: profile.email }
  const upsert = () =>
    supabase.from('organizer_profile').upsert(row, { onConflict: 'id', ignoreDuplicates: true })

  let { error } = await upsert()
  // Two signups with the same name at the same moment can both be given the
  // base slug; the loser's retry sees the winner's row and gets a suffix.
  if (error && isSlugClash(error)) {
    ;({ error } = await upsert())
  }
  if (error) {
    console.error('[organizer-profile] organizer_profile upsert failed', error)
    return { error }
  }

  await notifyOrganizerWelcome(supabase)
  return { error: null }
}
