'use client'

import ScannerCore from '../ScannerCore'
import { jsQrDecoder } from '@/lib/scan/decode'

export default function ScannerIphone() {
  return <ScannerCore decoder={jsQrDecoder} />
}
