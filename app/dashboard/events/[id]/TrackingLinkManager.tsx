'use client'

import { useMemo, useState, useTransition } from 'react'
import type { TrackingLink } from '@/lib/types'
import { createTrackingLink } from './actions'

type Props = {
  eventId: string
  eventSlug: string
  initialTrackingLinks: TrackingLink[]
}

const inputClass = 'w-full border border-gray-200 bg-white text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1d67ba] placeholder:text-gray-400'

function slugify(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const abbreviated = normalized
    .replace(/^instagram(?=-|$)/, 'ig')
    .replace(/^facebook(?=-|$)/, 'fb')

  return abbreviated
    .slice(0, 20)
    .replace(/-+$/g, '')
}

function formatCreatedAt(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TrackingLinkManager({ eventId, eventSlug, initialTrackingLinks }: Props) {
  const [links, setLinks] = useState(initialTrackingLinks)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const baseUrl = useMemo(() => {
    if (typeof window === 'undefined') return `https://tikkitte.com/e/${eventSlug}`
    return `${window.location.origin}/e/${eventSlug}`
  }, [eventSlug])
  const previewUrl = `${baseUrl}?ref=${slug || 'tracking-slug'}`

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugEdited) {
      setSlug(slugify(value))
    }
  }

  const copyUrl = async (trackingLink: TrackingLink) => {
    const url = `${baseUrl}?ref=${trackingLink.slug}`
    await navigator.clipboard.writeText(url)
    setCopiedId(trackingLink.id)
    window.setTimeout(() => setCopiedId(null), 1500)
  }

  const resetForm = () => {
    setName('')
    setSlug('')
    setSlugEdited(false)
  }

  const handleSubmit = () => {
    setError(null)
    setMessage(null)

    startTransition(async () => {
      const result = await createTrackingLink({ eventId, name, slug })
      if (!result.ok) {
        setError(result.message)
        return
      }

      setLinks((prev) => [result.trackingLink, ...prev])
      resetForm()
      setShowForm(false)
      setMessage('Tracking link created.')
    })
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-semibold text-gray-900 text-sm">Tracking links</h2>
          <p className="text-xs text-gray-400 mt-1">Create share URLs and monitor click volume for each channel.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="self-start text-sm font-semibold text-[#1d67ba] border border-[#1d67ba] rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create tracking link'}
        </button>
      </div>

      {showForm && (
        <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={inputClass}
                placeholder="Instagram bio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input
                value={slug}
                onChange={(e) => {
                  setSlugEdited(true)
                  setSlug(slugify(e.target.value))
                }}
                className={inputClass}
                placeholder="ig-bio"
              />
            </div>
            <div className="md:col-span-2">
              <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-[#1d67ba] break-all">
                {previewUrl}
              </p>
            </div>
          </div>
          {message && <p className="mt-3 text-sm text-green-600">{message}</p>}
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="mt-4 bg-[#1d67ba] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#1555a0] transition-colors disabled:opacity-60"
          >
            {isPending ? 'Creating...' : 'Create link'}
          </button>
        </div>
      )}

      {/* TODO: attribute ticket sales to tracking links after checkout stores the ref on payments. */}
      {links.length === 0 ? (
        <p className="text-sm text-gray-400">No tracking links yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 pr-4 font-medium text-gray-500">Link name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Slug</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">URL</th>
                <th className="text-right py-3 px-4 font-medium text-gray-500">Clicks</th>
                <th className="text-right py-3 pl-4 font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody>
              {links.map((trackingLink) => {
                const url = `${baseUrl}?ref=${trackingLink.slug}`
                return (
                  <tr key={trackingLink.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gray-900">{trackingLink.name}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-xs">{trackingLink.slug}</td>
                    <td className="py-3 px-4">
                      <div className="flex min-w-[260px] items-center gap-2">
                        <span className="truncate text-gray-500">{url}</span>
                        <button
                          type="button"
                          onClick={() => copyUrl(trackingLink)}
                          className="flex-shrink-0 rounded-md border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                        >
                          {copiedId === trackingLink.id ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">{trackingLink.clicks}</td>
                    <td className="py-3 pl-4 text-right text-gray-500 text-xs whitespace-nowrap">{formatCreatedAt(trackingLink.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
