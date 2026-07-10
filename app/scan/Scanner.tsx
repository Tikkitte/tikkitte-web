'use client'

import ScannerCore from './ScannerCore'
import { nativeDecoder } from '@/lib/scan/decode'

export default function Scanner() {
  return <ScannerCore decoder={nativeDecoder} />
}
