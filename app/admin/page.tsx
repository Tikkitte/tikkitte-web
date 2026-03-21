'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

type Request = {
  id: string
  name: string
  email: string
  created_at: string
  approved: boolean
}

export default function AdminPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)

  const load = async () => {
    const supabase = createClient()
    const { data: reqs } = await supabase
      .from('signup_requests')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: approved } = await supabase
      .from('organizer_profile')
      .select('id')

    const approvedIds = new Set((approved ?? []).map((r: { id: string }) => r.id))

    setRequests(
      (reqs ?? []).map(r => ({ ...r, approved: approvedIds.has(r.id) }))
    )
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const approve = async (id: string) => {
    setApproving(id)
    const supabase = createClient()
    await supabase.from('organizer_profile').upsert({ id })
    await load()
    setApproving(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo-square.png" alt="Tikkitte" width={28} height={28} className="rounded-md" />
          <span className="font-extrabold text-[#1d67ba]">Admin</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Dashboard →</Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">Organizer requests</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Approve requests to grant access to the organizer dashboard.</p>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : requests.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-10 text-center text-gray-400 text-sm">
            No requests yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {requests.map(req => (
              <div key={req.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{req.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{req.email}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {req.approved ? (
                  <span className="text-sm font-medium text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400 px-3 py-1 rounded-full shrink-0">Approved</span>
                ) : (
                  <button
                    onClick={() => approve(req.id)}
                    disabled={approving === req.id}
                    className="bg-[#1d67ba] text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-[#1555a0] transition-colors disabled:opacity-50 shrink-0"
                  >
                    {approving === req.id ? 'Approving…' : 'Approve'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
