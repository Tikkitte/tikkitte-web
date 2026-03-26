import Link from 'next/link'
import Image from 'next/image'

export default function Hero() {
  return (
    <section className="bg-white dark:bg-slate-950">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Tikkitte" width={32} height={32} />
          <span className="text-2xl font-extrabold text-[#1d67ba] tracking-tight">Tikkitte</span>
        </Link>
        <Link
          href="/organizers"
          className="text-sm font-semibold text-gray-700 dark:text-slate-300 hover:text-[#1d67ba] dark:hover:text-[#1d67ba] transition-colors"
        >
          Sell tickets
        </Link>
      </nav>

      {/* Hero content */}
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-8 text-center">
        <div className="inline-block bg-blue-50 dark:bg-blue-950 text-[#1d67ba] dark:text-blue-400 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
          Now available in Ghana
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight tracking-tight">
          Discover events in Ghana
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
          Browse upcoming events and buy tickets instantly. No account needed.
        </p>
      </div>
    </section>
  )
}
