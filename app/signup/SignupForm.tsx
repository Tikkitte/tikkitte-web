'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setAlreadyRegistered(false)
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })
    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }
    if (data.user?.identities && data.user.identities.length === 0) {
      setLoading(false)
      setAlreadyRegistered(true)
      return
    }
    setLoading(false)
    router.push(`/auth/verify?email=${encodeURIComponent(email)}`)
  }

  return (
    <>
      {alreadyRegistered && (
        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
          An account with this email already exists.{' '}
          <Link href="/login" className="font-medium text-[#3d3d3d] hover:underline">
            Sign in instead
          </Link>
        </div>
      )}

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name or organization</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="create-input text-sm placeholder:text-[#8a887c]"
            placeholder="e.g. Club Aria Events"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => {
              setEmail(e.target.value)
              setAlreadyRegistered(false)
            }}
            className="create-input text-sm placeholder:text-[#8a887c]"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="create-input text-sm placeholder:text-[#8a887c]"
            placeholder="At least 6 characters"
          />
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="create-focus mt-1 min-h-12 w-full rounded-full bg-[#191917] py-3 font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
        >
          {loading ? 'Submitting…' : 'Request access'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6">
        Already approved?{' '}
        <Link href="/login" className="create-focus font-medium text-[#2565d0] hover:underline">
          Sign in
        </Link>
      </p>
    </>
  )
}
