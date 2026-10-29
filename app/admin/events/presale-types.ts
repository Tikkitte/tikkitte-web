export type EventPresale = {
  listed: boolean
  slug: string | null
  maxPerEmail: number
  tickets: { id: string; label: string; price: number; presaleOnly: boolean; saleStartDate: string | null; saleEndDate: string | null }[]
  entryCount: number
  usedCount: number
  pendingCount: number
}
export type PresaleEntry = {
  email: string
  status: 'available' | 'pending' | 'used'
  reference: string | null
  quantity: number | null
  paidAt: string | null
}
export type PresaleImport = { added: number; alreadyListed: number; invalidCount: number; invalid: string[] }
export type PresaleSettings = { listed: boolean; maxPerEmail: number; presaleTicketIds: string[] }
