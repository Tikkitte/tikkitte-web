import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

// Cached per request: every Server Component in a single render shares this
// exact client/session instead of each creating its own. Without this, two
// independent clients can both see a near-expired access token after the tab
// was idle and each try to refresh it — the second one arrives with the same
// single-use refresh token the first already burned, gets `invalid_grant`,
// and silently drops to an unauthenticated session (falls back to the anon
// key). A query that then reads zero rows back gets misread as "no data"
// instead of "not authenticated" by anything that checks it.
export const createClient = cache(async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — middleware handles session refresh
          }
        },
      },
    }
  )
})

export const getAuthedUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})
