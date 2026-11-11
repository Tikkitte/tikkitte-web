import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient, getAuthedUser } from '@/lib/supabase/server'

// Admin pages render alongside the admin layout, not after it, so a page's
// own data loading can run before the layout's redirect takes effect. Every
// admin page that loads admin-only data calls this first, so a signed-out or
// non-admin visitor is redirected instead of hitting a permission error.
// Cached per request: the layout and page share one lookup.
export const requireAdmin = cache(async () => {
  const user = await getAuthedUser()
  if (!user) redirect('/login')

  const supabase = await createClient()
  const { data: adminRow } = await supabase
    .from('admin_user')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) redirect('/dashboard')

  return { supabase, user }
})
