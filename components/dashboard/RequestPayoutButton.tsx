'use client'

import { useState } from 'react'
import RequestPayoutModal from './RequestPayoutModal'

type Props = {
  availableBalance: number
  hasPayoutAccount: boolean
}

export default function RequestPayoutButton({ availableBalance, hasPayoutAccount }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center rounded-lg bg-[#3d3d3d] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
      >
        Request payout
      </button>
      {open && (
        <RequestPayoutModal
          availableBalance={availableBalance}
          hasPayoutAccount={hasPayoutAccount}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
