import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import ResetPasswordForm from './ResetPasswordForm'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#1a1a1a] p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/images/logo-create.png" alt="" width={42} height={28} priority className="h-7 w-auto" />
          <Image src="/images/text-logo-create.png" alt="Tikkitte Create" width={160} height={35} priority className="h-8 w-auto" />
        </Link>
        <div>
          <p className="text-3xl font-extrabold leading-snug text-white">
            Sell tickets.<br />Grow your audience.
          </p>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
            The organizer platform built for Ghana&apos;s event scene. Manage events, track revenue,
            and connect with your fans — all in one place.
          </p>
        </div>
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} Tikkitte</p>
      </div>

      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <Image src="/images/logo-create.png" alt="" width={42} height={28} priority className="h-6 w-auto" />
          <Image src="/images/text-logo-create.png" alt="Tikkitte Create" width={160} height={35} priority className="h-7 w-auto" />
        </Link>
        <div className="w-full max-w-sm mx-auto lg:mx-0">
          {user ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Set a new password</h1>
              <p className="text-sm text-gray-500 mb-8">Choose a new password for your account.</p>
              <ResetPasswordForm />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Link expired</h1>
              <p className="text-sm text-gray-500 mb-8">
                This password reset link is invalid or has expired.
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex w-full items-center justify-center bg-[#3d3d3d] text-white font-semibold py-3 rounded-lg hover:bg-[#2a2a2a] transition-colors"
              >
                Request a new link
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
