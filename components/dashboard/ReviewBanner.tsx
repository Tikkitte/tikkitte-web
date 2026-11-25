'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const contactNote: Record<string, string> = {
  call: 'we’ll call you',
  whatsapp: 'we’ll message you on WhatsApp',
  instagram: 'we’ll message you on Instagram',
  email: 'we’ll email you',
}

export default function ReviewBanner({ needsInfo, contact }: { needsInfo: boolean; contact?: string }) {
  // The edit event page is a single 840px column; match it.
  const narrow = /^\/dashboard\/events\/[^/]+\/edit$/.test(usePathname())
  return <aside role="status" className={`mb-6 flex items-start gap-3 rounded-2xl bg-[var(--tikkitte-blue-tint-soft)] px-5 py-4 text-sm leading-normal text-[var(--tikkitte-ink)] ${narrow ? 'mx-auto max-w-[840px]' : ''}`}>
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0 text-[var(--tikkitte-blue)]">
      <circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" />
    </svg>
    <p>
      {needsInfo
        ? 'We emailed you a question. Reply to it or update your application.'
        : `Your account is under review and ${contactNote[contact ?? ''] ?? 'we’ll be in touch'} within 24 to 48 hours. Publishing unlocks once you’re approved.`}
      {' '}<Link href="/dashboard/application" className="font-bold text-[var(--tikkitte-blue)] underline">{needsInfo ? 'Update application' : 'Edit application'}</Link>
    </p>
  </aside>
}
