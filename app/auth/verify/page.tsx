'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const RESEND_SECONDS = 30

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
}

const SUPABASE_FUNCTIONS_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1'

async function notifyOrganizerWelcome(supabase: ReturnType<typeof createClient>) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const accessToken = session?.access_token
    if (!accessToken) return
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/send-organizer-welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (!res.ok) {
      console.error('[auth/verify] send-organizer-welcome failed', res.status, await res.text())
    }
  } catch (err) {
    console.error('[auth/verify] send-organizer-welcome invoke failed', err)
  }
}

// Matches the slugify pattern used in the one-time DB backfill
// (20260703_organizer_profile_slug.sql): base slug from display_name,
// short id suffix if that base is already taken by someone else.
async function resolveOrganizerSlug(
  supabase: ReturnType<typeof createClient>,
  displayName: string,
  userId: string
): Promise<string | null> {
  const base = slugify(displayName)
  if (!base) return null
  const { data: existing } = await supabase
    .from('organizer_profile')
    .select('id')
    .eq('slug', base)
    .maybeSingle()
  if (!existing || existing.id === userId) return base
  return `${base}-${userId.slice(0, 6)}`
}

function VerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(RESEND_SECONDS)
  const [resending, setResending] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const verify = useCallback(async (code: string) => {
    if (code.length < 6) return
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' })

    // If OTP failed, check if user is already confirmed (token already consumed)
    if (error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        setError(error.message)
        return
      }
      // User is already confirmed — continue with profile creation
      const display_name = user.user_metadata?.display_name ?? ''
      const slug = await resolveOrganizerSlug(supabase, display_name, user.id)
      const { error: profileError } = await supabase.from('organizer_profile').upsert({
        id: user.id,
        display_name,
        email,
        slug,
      }, { onConflict: 'id', ignoreDuplicates: true })
      setLoading(false)
      if (profileError) {
        console.error('[auth/verify] organizer_profile upsert failed', profileError)
        setError('Your email was verified, but we could not finish setting up your account. Please contact support.')
        return
      }
      // Idempotent server-side (welcome_email_sent_at marker), so it's safe
      // to call on every successful verify, not just the first insert.
      await notifyOrganizerWelcome(supabase)
      router.push('/dashboard')
      router.refresh()
      return
    }

    setLoading(false)
    // Create organizer profile (pending approval)
    if (data.user) {
      const display_name = data.user.user_metadata?.display_name ?? ''
      const slug = await resolveOrganizerSlug(supabase, display_name, data.user.id)
      const { error: profileError } = await supabase.from('organizer_profile').upsert({
        id: data.user.id,
        display_name,
        email,
        slug,
      }, { onConflict: 'id', ignoreDuplicates: true })
      if (profileError) {
        console.error('[auth/verify] organizer_profile upsert failed', profileError)
        setError('Your email was verified, but we could not finish setting up your account. Please contact support.')
        return
      }
      await notifyOrganizerWelcome(supabase)
    }
    router.push('/dashboard')
    router.refresh()
  }, [email, router])

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    setDigits(next)
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = Array(6).fill('')
    pasted.split('').forEach((char, i) => { next[i] = char })
    setDigits(next)
    const focusIdx = Math.min(pasted.length, 5)
    inputRefs.current[focusIdx]?.focus()
  }

  const handleResend = async () => {
    setResending(true)
    const supabase = createClient()
    await supabase.auth.resend({ type: 'signup', email })
    setResending(false)
    setCountdown(RESEND_SECONDS)
    setDigits(Array(6).fill(''))
    setError(null)
    inputRefs.current[0]?.focus()
  }

  // Index of first empty box (for active border highlight)
  const activeIndex = digits.findIndex(d => d === '')

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pt-14">
      <div className="max-w-sm w-full mx-auto">
        <Link href="/signup" className="inline-flex items-center text-gray-500 mb-10 -ml-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Verify your email</h1>
        <p className="text-gray-500 mb-0.5">Enter the 6-digit code sent to</p>
        <p className="font-bold text-gray-900 mb-8">{email}</p>

        <div className="flex gap-2.5 mb-6" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-full aspect-square text-center text-xl font-bold rounded-2xl outline-none transition-colors border-2 ${
                i === activeIndex
                  ? 'border-[#1d67ba] bg-white text-gray-900'
                  : digit
                  ? 'border-[#1d67ba] bg-white text-gray-900'
                  : 'border-transparent bg-gray-100 text-gray-900'
              }`}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <button
          onClick={() => verify(digits.join(''))}
          disabled={digits.some(d => !d) || loading}
          className="w-full bg-[#1d67ba] text-white font-semibold py-4 rounded-2xl hover:bg-[#1555a0] transition-colors disabled:opacity-50 mb-5"
        >
          {loading ? 'Verifying…' : 'Verify'}
        </button>

        <div className="text-center text-sm text-gray-400">
          {countdown > 0 ? (
            <span>Resend code in {countdown}s</span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-[#1d67ba] font-medium hover:underline disabled:opacity-50"
            >
              {resending ? 'Sending…' : 'Resend code'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  )
}
