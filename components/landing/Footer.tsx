import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Image src="/images/logo-square.png" alt="Tikkitte" width={36} height={36} className="rounded-lg opacity-90" />
          <div>
            <span className="text-xl font-extrabold text-white tracking-tight">Tikkitte</span>
            <p className="text-sm mt-0.5">Event ticketing for Ghana</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
          <a href="mailto:admin@tikkitte.com" className="hover:text-white transition-colors">
            admin@tikkitte.com
          </a>
          <span className="hidden sm:block">·</span>
          <span>© {new Date().getFullYear()} Tikkitte</span>
        </div>
      </div>
    </footer>
  )
}
