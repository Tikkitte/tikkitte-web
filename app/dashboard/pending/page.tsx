import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto text-center">
        <Link href="/" className="block text-2xl font-extrabold text-[#1d67ba] tracking-tight mb-8">
          Tikkitte
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-4xl mb-4">⏳</div>
          <h1 className="text-xl font-bold text-gray-900 mb-3">Pending approval</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-2">
            Your account is under review. We&apos;ll email{' '}
            <span className="font-medium text-gray-700">{user.email}</span> once you&apos;re approved.
          </p>
          <p className="text-gray-400 text-sm">Usually within 24 hours.</p>
          <form action={handleSignOut} className="mt-6">
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 underline">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
