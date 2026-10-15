import type { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function TicketLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F2EC] font-grotesk text-[#191917]">
      {/* Header */}
      <header className="border-b border-[#E7E2D4] bg-[#F4F2EC]/95 px-4 py-3 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt=""
              width={42}
              height={28}
              style={{ width: 'auto', height: '24px' }}
            />
            <Image
              src="/images/text-logo-web.png"
              alt="Tikkitte"
              width={120}
              height={20}
              style={{ height: '18px', width: 'auto' }}
            />
          </Link>
        </div>
      </header>

      {children}

      <footer className="mt-8 border-t border-[#E7E2D4] px-4 py-6">
        <div className="mx-auto max-w-2xl text-center text-xs text-[#8a887c]">
          Powered by Tikkitte &middot; Event Ticketing for Ghana
        </div>
      </footer>
    </div>
  )
}
