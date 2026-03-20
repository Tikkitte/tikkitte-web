'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
        <div className="max-w-md w-full mx-auto">
          <Link href="/" className="block text-center text-2xl font-extrabold text-[#1d67ba] tracking-tight mb-8">
            Tikkitte
          </Link>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-xl font-bold text-gray-900 mb-3">Request received</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              We&apos;ve got your request. We&apos;ll review your account and email you at{' '}
              <span className="font-medium text-gray-700">{email}</span> once you&apos;re approved — usually within 24 hours.
            </p>
            <Link href="/" className="inline-block mt-6 text-sm text-[#1d67ba] font-medium hover:underline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md w-full mx-auto">
        <Link href="/" className="block text-center text-2xl font-extrabold text-[#1d67ba] tracking-tight mb-8">
          Tikkitte
        </Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Request organizer access</h1>
          <p className="text-sm text-gray-500 mb-6">We review all requests and approve within 24 hours.</p>
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your name or organization</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d67ba]"
                placeholder="e.g. Club Aria Events"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d67ba]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d67ba]"
                placeholder="At least 6 characters"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1d67ba] text-white font-semibold py-3 rounded-lg hover:bg-[#1555a0] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Submitting…' : 'Request access'}
            </button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-6">
            Already approved?{' '}
            <Link href="/login" className="text-[#1d67ba] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
