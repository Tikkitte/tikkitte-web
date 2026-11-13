'use client'

import type { TablePackage } from '@/lib/types'

// Interim solution: no in-app payment for tables. Guests contact the event
// organizer directly to check availability and reserve; the organizer marks
// a table unavailable from the dashboard once it's taken.

type Props = {
  table: TablePackage
}

export default function TableContact({ table }: Props) {
  return (
    <div className="mt-5 border-t border-[rgba(23,17,14,0.12)] pt-5">
      <h3 className="text-sm font-semibold text-[#17110E]">Reserve this table</h3>
      <p className="mt-1 text-sm text-[rgba(23,17,14,0.55)]">Contact the event organizer to check availability and reserve Table {table.table_code}.</p>
    </div>
  )
}
