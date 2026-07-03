'use client'

import { useRouter } from 'next/navigation'
import { type FormEvent, useState, useTransition } from 'react'
import { updateOrganizerProfile } from './actions'

type Props = {
  displayName: string
  email: string
  bio: string
}

const inputClass = 'w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1d67ba]'

export default function OrganizerProfileForm({ displayName, email, bio }: Props) {
  const router = useRouter()
  const [name, setName] = useState(displayName)
  const [bioValue, setBioValue] = useState(bio)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage(null)
    setError(null)

    startTransition(async () => {
      const result = await updateOrganizerProfile({
        displayName: name,
        bio: bioValue,
      })

      if (!result.ok) {
        setError(result.message)
        return
      }

      setMessage('Changes saved.')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-semibold text-gray-900">Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="display-name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Display name
            </label>
            <input
              id="display-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              className={inputClass}
              placeholder="Your organizer name"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <span className="text-xs text-gray-400">{bioValue.length}/500</span>
            </div>
            <textarea
              id="bio"
              value={bioValue}
              onChange={(event) => setBioValue(event.target.value)}
              maxLength={500}
              rows={5}
              className={inputClass}
              placeholder="Tell attendees about your organization"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {message && <p className="text-sm text-green-600">{message}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#1d67ba] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1555a0] disabled:opacity-60"
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Account</h2>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</p>
          <p className="mt-1 text-sm text-gray-700">{email}</p>
          <p className="mt-2 text-xs text-gray-400">This email cannot be changed here.</p>
        </div>
      </section>
    </div>
  )
}
