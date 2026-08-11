'use client'

import { useState } from 'react'
import RequestPayoutModal from './RequestPayoutModal'
import type { EventOutstandingPayout } from '@/lib/types'

type Props = {
  eventId: string
  breakdown: EventOutstandingPayout
  hasPayoutAccount: boolean
}

export default function RequestPayoutButton({ eventId, breakdown, hasPayoutAccount }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="create-focus flex min-h-12 w-full items-center justify-center rounded-full bg-[#2e6fe6] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2565d0]"
      >
        Request payout
      </button>
      {open && (
        <RequestPayoutModal
          eventId={eventId}
          breakdown={breakdown}
          hasPayoutAccount={hasPayoutAccount}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
