'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  eventUrl: string
}

export default function ShareLiveModal({ eventUrl }: Props) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Get your tickets → ${eventUrl}`)}`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent('Get your tickets')}&url=${encodeURIComponent(eventUrl)}`

  const copyLink = async () => {
    await navigator.clipboard.writeText(eventUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={() => router.push(pathname)}
          aria-label="Close share modal"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          ×
        </button>

        <div className="pt-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#3d3d3d]/10 text-[#3d3d3d]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7Z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">You&apos;re live</h2>
          <p className="mt-2 text-sm text-gray-500">Share your link and start selling tickets.</p>
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2">
          <input
            readOnly
            value={eventUrl}
            className="min-w-0 flex-1 bg-transparent px-2 text-sm font-medium text-gray-700 outline-none"
          />
          <button
            type="button"
            onClick={copyLink}
            className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#3d3d3d] shadow-sm hover:bg-gray-100 transition-colors"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-green-600">WA</span>
            WhatsApp
          </a>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="text-gray-900">X</span>
            Twitter
          </a>
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy link
          </button>
          <a
            href={eventUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17 17 7" /><path d="M7 7h10v10" />
            </svg>
            View event
          </a>
        </div>

        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="mt-6 w-full rounded-xl bg-[#3d3d3d] px-5 py-3 text-sm font-semibold text-white hover:bg-[#2a2a2a] transition-colors"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  )
}
