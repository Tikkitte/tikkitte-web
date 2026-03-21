'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RefreshButton() {
  const router = useRouter()
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleCheck = async () => {
    setChecking(true)
    setMessage(null)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('organizer_profile')
      .select('approved')
      .eq('id', user.id)
      .maybeSingle()

    if (profile?.approved) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setMessage('Not approved yet — check back soon.')
      setChecking(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleCheck}
        disabled={checking}
        className="bg-[#1d67ba] text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-[#1555a0] transition-colors disabled:opacity-60"
      >
        {checking ? 'Checking…' : 'Go to dashboard'}
      </button>
      {message && (
        <p className="text-sm text-gray-400 dark:text-gray-500">{message}</p>
      )}
    </div>
  )
}
