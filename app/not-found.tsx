import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-16 text-center">

      {/* Brand logo */}
      <Link href="/" className="mb-14 flex items-center gap-2">
        <Image
          src="/images/logo.png"
          alt=""
          width={42}
          height={28}
          unoptimized
          priority
          style={{ width: 'auto', height: '28px' }}
        />
        <Image
          src="/images/text-logo-web.png"
          alt="Tikkitte"
          width={120}
          height={20}
          unoptimized
          priority
          style={{ height: '20px', width: 'auto' }}
        />
      </Link>

      {/* Decorative 404 — outline/watermark style matching the landing page */}
      <p
        aria-hidden="true"
        className="text-[clamp(5.5rem,20vw,13rem)] font-extrabold leading-none tracking-tighter select-none mb-4"
        style={{
          color: 'transparent',
          WebkitTextStrokeWidth: '2px',
          WebkitTextStrokeColor: 'rgba(59,130,246,0.3)',
        }}
      >
        404
      </p>

      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
        Page not found
      </h1>

      <p className="text-gray-500 max-w-xs mx-auto mb-10 leading-relaxed">
        This page doesn&apos;t exist — it may have moved or the link is broken.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.98] text-white font-semibold px-8 py-3.5 rounded-2xl transition-all duration-150 text-sm"
      >
        ← Back to Tikkitte
      </Link>

    </div>
  )
}
