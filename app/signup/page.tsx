import Link from 'next/link'
import Image from 'next/image'
import SignupForm from './SignupForm'

export default function SignupPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — server-rendered, no JS needed */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#1a1a1a] p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/images/logo-create.png" alt="" width={42} height={28} priority className="h-7 w-auto" />
          <Image src="/images/text-logo-create.png" alt="Tikkitte Create" width={160} height={35} priority className="h-8 w-auto" />
        </Link>
        <div>
          <p className="text-3xl font-extrabold leading-snug text-white">
            Ready to start<br />selling tickets?
          </p>
          <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
            Join organisers across Ghana using Tikkitte to run events, manage fans, and get paid — without the hassle.
          </p>
        </div>
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} Tikkitte</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-16">
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <Image src="/images/logo-create.png" alt="" width={42} height={28} priority className="h-6 w-auto" />
          <Image src="/images/text-logo-create.png" alt="Tikkitte Create" width={160} height={35} priority className="h-7 w-auto" />
        </Link>
        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Request access</h1>
          <p className="text-sm text-gray-500 mb-8">We review all requests and approve within 24 hours.</p>
          <SignupForm />
        </div>
      </div>
    </div>
  )
}
