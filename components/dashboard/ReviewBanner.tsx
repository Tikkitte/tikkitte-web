import Link from 'next/link'

const contactNote: Record<string, string> = {
  call: 'we’ll call you',
  whatsapp: 'we’ll message you on WhatsApp',
  instagram: 'we’ll message you on Instagram',
  email: 'we’ll email you',
}

export default function ReviewBanner({ needsInfo, contact }: { needsInfo: boolean; contact?: string }) {
  return <aside className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
    <p>
      {needsInfo
        ? 'We emailed you a question. Reply to it or update your application.'
        : `Your account is under review and ${contactNote[contact ?? ''] ?? 'we’ll be in touch'} within 24 to 48 hours. Publishing unlocks once you’re approved.`}
      {' '}<Link href="/dashboard/application" className="font-semibold underline">{needsInfo ? 'Update application' : 'Edit application'}</Link>
    </p>
  </aside>
}
