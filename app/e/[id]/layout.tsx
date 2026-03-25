import Link from 'next/link'

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950">
      <header className="border-b border-gray-100 dark:border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Tikkitte
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-gray-100 dark:border-slate-800 px-4 py-6">
        <div className="max-w-2xl mx-auto text-center text-xs text-gray-400 dark:text-slate-500">
          Powered by Tikkitte &middot; Event Ticketing for Ghana
        </div>
      </footer>
    </div>
  )
}
