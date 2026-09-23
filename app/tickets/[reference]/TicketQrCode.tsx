'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Props = {
  ticketId: string
  initialQrCode: string | null
}

const POLL_INTERVAL_MS = 1500
const MAX_ATTEMPTS = 10 // ~15s — generateAndAttachQrCodes runs after verify-payment
// responds (runAfterResponse/EdgeRuntime.waitUntil), so the QR code can still be
// null for a short window right after landing here straight from checkout.

export default function TicketQrCode({ ticketId, initialQrCode }: Props) {
  const [qrCode, setQrCode] = useState(initialQrCode)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (qrCode || attempts >= MAX_ATTEMPTS) return
    const timer = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('user_ticket')
        .select('qr_code')
        .eq('id', ticketId)
        .maybeSingle()
      if (data?.qr_code) {
        setQrCode(data.qr_code)
      } else {
        setAttempts((n) => n + 1)
      }
    }, POLL_INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [qrCode, attempts, ticketId])

  if (qrCode) {
    return (
      <div className="flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrCode}
          alt="Ticket QR Code"
          className="h-48 w-48 rounded-xl border border-[#E4DFD1] bg-white"
        />
        <p className="mt-2 text-xs text-[#8a887c]">
          Show this QR code at the entrance
        </p>
      </div>
    )
  }

  if (attempts >= MAX_ATTEMPTS) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-[#E4DFD1] bg-[#F4F2EC] px-4 py-6 text-center">
        <p className="text-sm text-[#5F5D54]">Your QR code is taking longer than expected to generate.</p>
        <p className="mt-1 text-xs text-[#8a887c]">Refresh this page in a moment, or check your email.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center rounded-xl border border-[#E4DFD1] bg-[#F4F2EC] px-4 py-8">
      <svg className="h-6 w-6 animate-spin text-[#2565D0]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <p className="mt-2 text-xs text-[#8a887c]">Generating your QR code…</p>
    </div>
  )
}
