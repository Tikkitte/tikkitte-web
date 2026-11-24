'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { applicationOptions, normalizeApplicationPhone, normalizeInstagram } from '@/lib/organizer-application'

type Initial = Record<string, string | boolean | null>
export default function OrganizerApplicationForm({ organizerId, initial = {}, instagram = '', needsInfo = false, editing = false }: {
  organizerId: string; initial?: Initial; instagram?: string; needsInfo?: boolean; editing?: boolean
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const text = (key: string) => String(form.get(key) ?? '').trim()
    const phone = normalizeApplicationPhone(text('phone'))
    const instagramUrl = normalizeInstagram(text('instagram'))
    if (!phone) { setError('Enter a valid phone number, such as 024 123 4567 or +233…'); return }
    if (instagramUrl === null) { setError('Enter an Instagram handle or profile URL.'); return }
    setBusy(true); setError('')
    try {
      const supabase = createClient()
      const { error: profileError } = await supabase.from('organizer_profile').update({ instagram_url: instagramUrl || null }).eq('id', organizerId)
      if (profileError) throw profileError
      const answers = {
        organizer_type: text('organizer_type'), phone, preferred_contact: text('preferred_contact'), heard_from: text('heard_from') || null,
      }
      const result = editing
        ? await supabase.from('organizer_application').update(answers).eq('organizer_id', organizerId).select('organizer_id').single()
        : await supabase.from('organizer_application').insert({ organizer_id: organizerId, ...answers }).select('organizer_id').single()
      if (result.error) throw result.error
      if (needsInfo) {
        const { error } = await supabase.rpc('resubmit_organizer_application')
        if (error) throw error
      }
      if (!editing) {
        try {
          const { error } = await supabase.functions.invoke('send-organizer-welcome', { body: {} })
          if (error) console.error('[organizer-application] welcome email failed')
        } catch { console.error('[organizer-application] welcome email failed') }
      }
      router.push(editing ? '/dashboard' : '/dashboard?intro=1'); router.refresh()
    } catch { setError('Could not save your application. Your account status may have changed. Reload and try again.') }
    finally { setBusy(false) }
  }
  const input = 'create-input mt-1 w-full text-sm'
  const requiredMark = <span aria-hidden="true" className="text-red-600"> *</span>
  const select = (key: keyof typeof applicationOptions, label: string) => (
    <label className="block text-sm font-medium">{label}{requiredMark}
      <select name={key} required defaultValue={String(initial[key] ?? '')} className={input}>
        <option value="">Select…</option>{applicationOptions[key].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
  )
  return <form method="post" onSubmit={submit} className="space-y-5">
    {select('organizer_type', 'What best describes you?')}
    <label className="block text-sm font-medium">Instagram handle<input name="instagram" defaultValue={instagram} maxLength={200} placeholder="@yourhandle" className={input} /><span className="mt-1 block text-xs font-normal text-gray-500">The quickest way for us to verify you.</span></label>
    <label className="block text-sm font-medium">Phone number{requiredMark}<input name="phone" type="tel" required defaultValue={String(initial.phone ?? '')} placeholder="024 123 4567 or +233…" maxLength={30} className={input} /><span className="mt-1 block text-xs font-normal text-gray-500">We’ll use this to contact you about your account. No marketing texts.</span></label>
    {select('preferred_contact', 'Best way to reach you')}
    <label className="block text-sm font-medium">How did you hear about Tikkitte?<input name="heard_from" maxLength={200} defaultValue={String(initial.heard_from ?? '')} className={input} /></label>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <button disabled={busy} className="create-focus min-h-12 rounded-full bg-[#2e6fe6] px-7 text-sm font-bold text-white disabled:opacity-50">{busy ? 'Saving…' : needsInfo ? 'Save and send for review' : editing ? 'Save' : 'Send application'}</button>
    <p className="text-xs text-gray-500">Need help? Email <a href="mailto:admin@tikkitte.com" className="underline">admin@tikkitte.com</a></p>
  </form>
}
