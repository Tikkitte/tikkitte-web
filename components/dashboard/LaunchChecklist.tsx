import Link from 'next/link'
export default function LaunchChecklist({ name, profileComplete, hasInstagram, eventId, hasPayout, approved }: {
  name: string; profileComplete: boolean; hasInstagram: boolean; eventId?: string; hasPayout: boolean; approved: boolean
}) {
  const steps = [
    { label: 'Complete your profile', done: profileComplete, href: '/dashboard/settings', hint: !hasInstagram ? 'Add your Instagram so buyers can find you.' : '' },
    { label: 'Create your first event', done: Boolean(eventId), href: eventId ? `/dashboard/events/${eventId}` : '/dashboard/events/new', hint: '' },
    { label: 'Add a payout account', done: hasPayout, href: '/dashboard/settings#payout-account', hint: '' },
    { label: 'Publish your event', done: false, href: approved ? eventId ? `/dashboard/events/${eventId}` : '/dashboard/events/new' : null, hint: approved ? '' : 'Unlocks once we approve your account.' },
  ]
  return <div className="mx-auto max-w-2xl"><h1 className="create-display text-[34px]">Welcome to Tikkitte, {name}</h1><p className="mb-6 mt-2 text-sm text-gray-500">{steps.filter(step => step.done).length} of 4 done</p>
    <ol className="create-card divide-y divide-gray-100">{steps.map((step, index) => <li key={step.label} className="flex items-start gap-4 p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">{step.done ? '✓' : index + 1}</span><div>{step.href ? <Link className="font-semibold hover:underline" href={step.href}>{step.label} →</Link> : <p className="font-semibold">{step.label}</p>}{step.hint && <p className="mt-1 text-xs text-gray-500">{step.hint}</p>}</div></li>)}</ol>
    <Link href="/dashboard?intro=1" data-organizer-intro-trigger className="create-focus mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[#2565d0]">See what you can do</Link>
    <p className="mt-5 text-xs text-gray-500">Need help? Email <a href="mailto:admin@tikkitte.com" className="underline">admin@tikkitte.com</a></p>
  </div>
}
