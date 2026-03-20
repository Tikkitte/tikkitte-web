export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12 mt-auto">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-xl font-extrabold text-white tracking-tight">Tikkitte</span>
          <p className="text-sm mt-1">Event ticketing for Ghana</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
          <a href="mailto:hello@tikkitte.com" className="hover:text-white transition-colors">
            hello@tikkitte.com
          </a>
          <span className="hidden sm:block">·</span>
          <span>© {new Date().getFullYear()} Tikkitte</span>
        </div>
      </div>
    </footer>
  )
}
