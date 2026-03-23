import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import DashboardNav from '@/components/dashboard/DashboardNav'

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('organizer_profile')
    .select('display_name, approved')
    .eq('id', user.id)
    .maybeSingle()

  // Unapproved organizers see the pending page without the dashboard shell
  if (!profile?.approved) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col">
      {/* Top nav */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-10 shadow-sm dark:shadow-slate-950/20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="Tikkitte" width={28} height={28} />
              <span className="text-xl font-extrabold text-[#1d67ba] tracking-tight">Tikkitte</span>
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-slate-400 hidden sm:block">
              {profile?.display_name ?? user.email}
            </span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </div>
    </div>
  )
}
