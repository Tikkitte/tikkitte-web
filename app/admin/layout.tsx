import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: adminRow } = await supabase
    .from('admin_user')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!adminRow) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
        {children}
      </main>
    </div>
  )
}
