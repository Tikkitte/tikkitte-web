import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import RefreshButton from './RefreshButton'

export default async function PendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // If already approved, send straight to dashboard
  const { data: profile } = await supabase
    .from('organizer_profile')
    .select('approved')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.approved) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 px-4">
      <div className="max-w-sm w-full mx-auto text-center">
        <Image
          src="/images/logo-square.png"
          alt="Tikkitte"
          width={44}
          height={44}
          className="rounded-xl mx-auto mb-10"
        />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Application under review
        </h1>

        <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed mb-1">
          We&apos;re reviewing your organizer request.
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-[15px] leading-relaxed mb-1">
          We&apos;ll notify you at
        </p>
        <p className="font-semibold text-gray-900 dark:text-white text-[15px] mb-6">
          {user.email}
        </p>

        <p className="text-gray-400 dark:text-gray-500 text-sm mb-8">
          This usually takes less than 24 hours.
        </p>

        <RefreshButton />
      </div>
    </div>
  )
}
