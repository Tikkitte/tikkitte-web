import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Cookie-free client for anonymous public reads. It uses the same public anon
// key as the browser and remains subject to Supabase RLS. Keep authenticated or
// user-specific reads on lib/supabase/server.ts instead.
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
