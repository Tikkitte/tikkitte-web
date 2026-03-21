import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Top nav */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image src="/images/logo-square.png" alt="Tikkitte" width={28} height={28} className="rounded-md" />
            <span className="text-xl font-extrabold text-[#1d67ba] tracking-tight">Tikkitte</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
              {profile?.display_name ?? user.email}
            </span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors">
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
