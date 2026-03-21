import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default async function PendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-8">
          <Image src="/images/logo-square.png" alt="Tikkitte" width={36} height={36} className="rounded-lg" />
          <span className="text-2xl font-extrabold text-[#1d67ba] tracking-tight">Tikkitte</span>
        </Link>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Pending approval</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-2">
            Your account is under review. We&apos;ll email{' '}
            <span className="font-medium text-gray-700 dark:text-gray-300">{user.email}</span> once you&apos;re approved.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Usually within 24 hours.</p>
          <form action={handleSignOut} className="mt-6">
            <button type="submit" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white underline">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
