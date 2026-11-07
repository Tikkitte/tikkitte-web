'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ensureOrganizerProfile } from '@/lib/organizer-profile'

type Props = {
  userId: string
  email: string
  initialDisplayName: string
}

// Shown when a signed-in account has no organizer_profile row, for example
// when the row insert failed after the signup code was already used. Creates
// the row (from the signup name, or one entered here) and refreshes, so the
// page then shows the normal "under review" state.
export default function CompleteOrganizerProfile({ userId, email, initialDisplayName }: Props) {
  const router = useRouter()
  const autoStart = initialDisplayName.length > 0
  const [name, setName] = useState(initialDisplayName)
  const [saving, setSaving] = useState(autoStart)
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  const createProfile = useCallback(async (displayName: string) => {
    const { error: profileError } = await ensureOrganizerProfile(createClient(), {
      id: userId,
      displayName,
      email,
    })
    return profileError === null
  }, [userId, email])

  const finish = useCallback((ok: boolean) => {
    if (ok) {
      router.refresh()
      return
    }
    setSaving(false)
    setError('We could not finish setting up your account. Please try again or contact support.')
  }, [router])

  useEffect(() => {
    if (!autoStart || started.current) return
    started.current = true
    createProfile(initialDisplayName).then(finish)
  }, [autoStart, initialDisplayName, createProfile, finish])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    createProfile(trimmed).then(finish)
  }

  if (autoStart && saving && !error) {
    return <p className="text-gray-500 text-[15px]">Finishing your account setup…</p>
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      <div>
        <label htmlFor="organizer-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Your name or organization
        </label>
        <input
          id="organizer-name"
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="create-input text-sm placeholder:text-[#8a887c]"
          placeholder="e.g. Club Aria Events"
        />
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={saving || !name.trim()}
        className="bg-[#3d3d3d] text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-[#2a2a2a] transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving…' : 'Continue'}
      </button>
    </form>
  )
}
