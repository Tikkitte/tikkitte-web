import { redirect } from 'next/navigation'
import { getOrganizerContext } from '@/lib/organizer-context'
export default async function DeclinedPage() {
  const { user, profile } = await getOrganizerContext()
  if (!user) redirect('/login')
  if (profile?.review_status !== 'declined') redirect('/dashboard')
  return <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6"><div className="create-card max-w-md p-8 text-center"><h1 className="create-display text-3xl">We couldn’t approve your organizer account</h1><p className="mt-4 text-sm text-gray-500">If you think this is a mistake, reply to our email.</p><p className="mt-4 text-sm">Need help? Email <a className="underline" href="mailto:admin@tikkitte.com">admin@tikkitte.com</a></p></div></div>
}
