'use client'

import type { TablePackage } from '@/lib/types'

// Interim solution: no in-app payment for tables. Guests reach out to the
// organizer directly (WhatsApp, call, however) to check availability and
// reserve; the organizer marks a table unavailable from the dashboard once
// it's taken.
const CONTACT_NUMBERS = ['050 436 6525', '055 733 9771']

type Props = {
  table: TablePackage
}

export default function TableContact({ table }: Props) {
  return (
    <div className="mt-5 border-t border-[rgba(23,17,14,0.12)] pt-5">
      <h3 className="text-sm font-semibold text-[#17110E]">Reserve this table</h3>
      <p className="mt-1 text-sm text-[rgba(23,17,14,0.55)]">Message us on WhatsApp to check availability and reserve Table {table.table_code}.</p>
      <div className="mt-3 grid gap-2">
        {CONTACT_NUMBERS.map((number) => (
          <div
            key={number}
            className="flex items-center justify-center gap-2 rounded-full bg-[#1596B7]/10 px-5 py-3.5 text-sm font-bold text-[#1596B7]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.77.46 3.45 1.27 4.9L2 22l5.25-1.38A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.2a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.03-.2-.31A8.19 8.19 0 1 1 20.24 12a8.2 8.2 0 0 1-8.2 8.2Zm4.5-6.13c-.25-.12-1.45-.71-1.68-.8-.22-.08-.39-.12-.55.13-.16.24-.63.79-.78.95-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.99-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.24-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42h-.47a.9.9 0 0 0-.65.31c-.22.24-.85.83-.85 2.03 0 1.2.87 2.36.99 2.52.12.16 1.71 2.61 4.14 3.66.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.09.47-.07 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.11-.22-.17-.47-.29Z" />
            </svg>
            {number}
          </div>
        ))}
      </div>
    </div>
  )
}
