import type { Metadata } from 'next'
import Scanner from './Scanner'

export const metadata: Metadata = {
  title: 'Ticket Scanner | Tikkitte',
  description: 'Scan and verify tickets at the door.',
}

export default function ScanPage() {
  return <Scanner />
}
