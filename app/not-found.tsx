import Image from 'next/image'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F2EC] px-6 py-16 text-center font-grotesk">

      {/* Brand logo */}
      <Link href="/" className="mb-14 flex items-center gap-2">
        <Image
          src="/images/logo.png"
          alt=""
          width={42}
          height={28}
          preload
          style={{ width: 'auto', height: '28px' }}
        />
        <Image
          src="/images/text-logo-web.png"
          alt="Tikkitte"
          width={120}
          height={20}
          preload
          style={{ height: '20px', width: 'auto' }}
        />
      </Link>

      {/* Decorative 404 — outline/watermark style matching the landing page */}
      <p
        aria-hidden="true"
        className="mb-4 select-none font-anton font-normal text-[clamp(5.5rem,20vw,13rem)] leading-none"
        style={{
          color: 'transparent',
          WebkitTextStrokeWidth: '2px',
          WebkitTextStrokeColor: 'rgba(37,101,208,0.3)',
        }}
      >
        404
      </p>

      <h1 className="mb-4 font-anton font-normal text-4xl uppercase tracking-normal text-[#191917] sm:text-5xl">
        Page not found
      </h1>

      <p className="mx-auto mb-10 max-w-xs leading-relaxed text-[#5F5D54]">
        This page doesn&apos;t exist — it may have moved or the link is broken.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full bg-[#2565D0] px-8 py-3.5 text-sm font-semibold text-white transition-all duration-150 hover:bg-[#1E56B5] active:scale-[0.98]"
      >
        ← Back to Tikkitte
      </Link>

    </div>
  )
}
