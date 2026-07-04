'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#1a1a1a] p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/images/logo-create.png" alt="" width={42} height={28} unoptimized className="h-7 w-auto" />
          <Image src="/images/text-logo-create.png" alt="Tikkitte Create" width={160} height={35} unoptimized className="h-8 w-auto" />
        </Link>

        <div>
          <p className="text-3xl font-extrabold leading-snug text-white">
            Sell tickets.<br />Grow your audience.
          </p>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
            The organizer platform built for Ghana&apos;s event scene. Manage events, track revenue, and connect with your fans — all in one place.
          </p>
        </div>

        <p className="text-xs text-gray-600">© {new Date().getFullYear()} Tikkitte</p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <Image src="/images/logo-create.png" alt="" width={42} height={28} unoptimized className="h-6 w-auto" />
          <Image src="/images/text-logo-create.png" alt="Tikkitte Create" width={160} height={35} unoptimized className="h-7 w-auto" />
        </Link>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-8">Welcome back to Tikkitte Create.</p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3d3d] placeholder:text-gray-400"
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
                className="w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3d3d] placeholder:text-gray-400"
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3d3d3d] text-white font-semibold py-3 rounded-lg hover:bg-[#2a2a2a] transition-colors disabled:opacity-60 mt-1"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-[#3d3d3d] hover:underline">
              Request access
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
