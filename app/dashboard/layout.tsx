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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="" width={42} height={28} unoptimized style={{ width: 'auto', height: '24px', display: 'block', flexShrink: 0 }} />
              <Image src="/images/text-logo-web.png" alt="Tikkitte" width={120} height={20} unoptimized style={{ height: '18px', width: 'auto', display: 'block' }} />
            </Link>
            <DashboardNav />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              {profile?.display_name ?? user.email}
            </span>
            <form action={signOut}>
              <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
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
