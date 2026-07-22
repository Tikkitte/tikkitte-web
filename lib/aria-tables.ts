import type { TablePackage } from '@/lib/types'

export const ARIA_CANVAS_WIDTH = 840
export const ARIA_CANVAS_HEIGHT = 930
export const ARIA_ACCENT = '#2AC8EC'

export type AriaTableGeometry = Pick<TablePackage, 'table_code' | 'table_kind'> & {
  x: number
  y: number
  width: number
  height: number
}

export const ARIA_TABLES: AriaTableGeometry[] = [
  { table_code: 'S1', table_kind: 'section', x: 11, y: 26, width: 60, height: 62 },
  { table_code: 'S2', table_kind: 'section', x: 11, y: 91, width: 60, height: 62 },
  { table_code: 'S3', table_kind: 'section', x: 11, y: 156, width: 60, height: 62 },
  { table_code: 'S4', table_kind: 'section', x: 11, y: 221, width: 60, height: 62 },
  { table_code: 'T1', table_kind: 'section', x: 83, y: 22, width: 142, height: 100 },
  { table_code: 'T2', table_kind: 'section', x: 241, y: 22, width: 142, height: 100 },
  { table_code: 'T3', table_kind: 'section', x: 421, y: 22, width: 128, height: 158 },
  { table_code: 'C1', table_kind: 'section', x: 90, y: 142, width: 142, height: 123 },
  { table_code: 'C2', table_kind: 'section', x: 248, y: 142, width: 142, height: 123 },
  { table_code: 'F1', table_kind: 'floor', x: 24, y: 294, width: 50, height: 50 },
  { table_code: 'F2', table_kind: 'floor', x: 24, y: 354, width: 50, height: 50 },
  { table_code: 'F3', table_kind: 'floor', x: 24, y: 414, width: 50, height: 50 },
  { table_code: 'F4', table_kind: 'floor', x: 106, y: 530, width: 58, height: 58 },
  { table_code: 'F5', table_kind: 'floor', x: 186, y: 530, width: 58, height: 58 },
  { table_code: 'F6', table_kind: 'floor', x: 266, y: 530, width: 58, height: 58 },
  { table_code: 'R1', table_kind: 'round', x: 408, y: 676, width: 40, height: 40 },
  { table_code: 'R2', table_kind: 'round', x: 464, y: 676, width: 40, height: 40 },
  { table_code: 'R3', table_kind: 'round', x: 520, y: 676, width: 40, height: 40 },
  { table_code: 'R4', table_kind: 'round', x: 576, y: 676, width: 40, height: 40 },
  { table_code: 'R5', table_kind: 'round', x: 632, y: 676, width: 40, height: 40 },
  { table_code: 'R6', table_kind: 'round', x: 590, y: 576, width: 48, height: 48 },
  { table_code: 'SQ', table_kind: 'floor', x: 690, y: 636, width: 82, height: 82 },
]

export function formatGhs(value: number) {
  return `GHS ${Number(value || 0).toLocaleString('en-GH')}`
}

