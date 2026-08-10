import { createClient, getAuthedUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const user = await getAuthedUser()
  if (!user) redirect('/login')

  const { data: adminRow } = await supabase
    .from('admin_user')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) redirect('/dashboard')

  return (
    <div className="create-shell flex min-h-dvh flex-col bg-[var(--tikkitte-cream)] md:flex-row">
      <AdminNav displayName={user.email ?? 'Administrator'} />
      <main className="min-w-0 flex-1 px-4 py-7 md:px-8 md:py-8 lg:px-10">
        <div className="mx-auto w-full max-w-[1220px]">{children}</div>
      </main>
    </div>
  )
}
