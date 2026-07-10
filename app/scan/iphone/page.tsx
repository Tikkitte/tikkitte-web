import type { Metadata } from 'next'
import ScannerIphone from './ScannerIphone'

export const metadata: Metadata = {
  title: 'Ticket Scanner (iPhone) | Tikkitte',
  description: 'Scan and verify tickets at the door on iPhone.',
}

export default function ScanIphonePage() {
  return <ScannerIphone />
}
