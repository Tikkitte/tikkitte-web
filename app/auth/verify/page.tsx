'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const RESEND_SECONDS = 30

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
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' })
    setLoading(false)
    if (error) { setError(error.message); return }
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
    if (digit && index === 5) {
      verify([...next].join(''))
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
    if (pasted.length === 6) verify(pasted)
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
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col px-6 pt-14">
      <div className="max-w-sm w-full mx-auto">
        <Link href="/signup" className="inline-flex items-center text-gray-500 dark:text-gray-400 mb-10 -ml-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Verify your email</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-0.5">Enter the 6-digit code sent to</p>
        <p className="font-bold text-gray-900 dark:text-white mb-8">{email}</p>

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
                  ? 'border-[#1d67ba] bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                  : digit
                  ? 'border-[#1d67ba] bg-white dark:bg-gray-900 text-gray-900 dark:text-white'
                  : 'border-transparent bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
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

        <div className="text-center text-sm text-gray-400 dark:text-gray-500">
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
