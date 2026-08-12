'use client'

import { ARIA_ACCENT, ARIA_CANVAS_HEIGHT, ARIA_CANVAS_WIDTH, ARIA_TABLES } from '@/lib/aria-tables'
import type { TablePackage } from '@/lib/types'

export type TableStyle = {
  fill: string
  fillOpacity: number
  stroke: string
  strokeOpacity: number
}

function tableStateLabel(table: TablePackage | undefined): string {
  if (!table) return 'Unavailable'
  if (!table.enabled) return 'Disabled'
  if (table.reservation_status === 'awaiting_payment') return 'Payment in progress'
  if (table.reservation_status === 'booked') return 'Booked'
  return 'Available'
}

type Props = {
  packages: TablePackage[]
  selectedCode?: string | null
  onSelect?: (code: string) => void
  isSelectable?: (table: TablePackage | undefined) => boolean
  getTableStyle: (table: TablePackage | undefined, isSelected: boolean) => TableStyle
  className?: string
  /** 'dark' (default) is the original nightclub backdrop; 'light' is the cream/ink Gallery look. */
  theme?: 'dark' | 'light'
  accentColor?: string
}

const THEME_TOKENS = {
  dark: { backdrop: '#D7E6EE', backdropOpacity: 0.4, fill: '#DCEBF0', fillOpacity: 0.03, label: '#E4EEF4', selectedLabel: '#06232b' },
  light: { backdrop: 'rgba(23,17,14,0.55)', backdropOpacity: 1, fill: 'rgba(23,17,14,0.02)', fillOpacity: 1, label: '#17110E', selectedLabel: '#FDFCFA' },
}

export default function AriaFloorPlanSvg({
  packages,
  selectedCode = null,
  onSelect,
  isSelectable,
  getTableStyle,
  className,
  theme = 'dark',
  accentColor,
}: Props) {
  const packageByCode = new Map(packages.map((table) => [table.table_code, table]))
  const accent = accentColor ?? ARIA_ACCENT
  const t = THEME_TOKENS[theme]

  return (
    <svg
      viewBox={`0 0 ${ARIA_CANVAS_WIDTH} ${ARIA_CANVAS_HEIGHT}`}
      className={className ?? 'h-auto w-full'}
      role="img"
      aria-label="ARIA nightclub table layout"
    >
      <defs>
        <linearGradient id="aria-level-top" gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="372" y2="0">
          <stop offset="0" stopColor={accent} stopOpacity="0" /><stop offset="0.12" stopColor={accent} stopOpacity="0.4" />
          <stop offset="0.88" stopColor={accent} stopOpacity="0.4" /><stop offset="1" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="aria-level-bottom" gradientUnits="userSpaceOnUse" x1="99" y1="0" x2="372" y2="0">
          <stop offset="0" stopColor={accent} stopOpacity="0" /><stop offset="0.12" stopColor={accent} stopOpacity="0.4" />
          <stop offset="0.88" stopColor={accent} stopOpacity="0.4" /><stop offset="1" stopColor={accent} stopOpacity="0" />
        </linearGradient>
        <pattern id="aria-unavailable" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={t.backdrop} strokeOpacity={theme === 'dark' ? 0.1 : 0.12} strokeWidth="4" />
        </pattern>
      </defs>

      <path d="M6 903 L6 11 L563 11 L563 560 L783 560 L783 570 M783 618 L783 735 M783 790 L783 800 L90 800 L90 903 L6 903 M6 800 L62 800" fill="none" stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="413" y1="198" x2="563" y2="198" stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.8" />
      <polygon points="380,290 563,290 563,595 380,630" fill={t.fill} fillOpacity={t.fillOpacity} stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.8" strokeLinejoin="round" />
      <g stroke={accent} strokeOpacity="0.6" fill="none" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M453 424 L489 424 L471 444 Z" /><line x1="471" y1="444" x2="471" y2="462" /><line x1="461" y1="462" x2="481" y2="462" />
      </g>
      <g stroke={t.backdrop} strokeOpacity={t.backdropOpacity} fill="none">
        <rect x="6" y="471" width="85" height="159" fill={t.fill} fillOpacity={t.fillOpacity} strokeWidth="1.8" />
        <g stroke={accent} strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round">
          <path d="M32 542 A16 16 0 0 1 64 542" /><rect x="28" y="542" width="8" height="15" rx="3" /><rect x="60" y="542" width="8" height="15" rx="3" />
        </g>
      </g>
      <line x1="398" y1="725" x2="783" y2="725" stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.8" />
      <text x="798" y="594" transform="rotate(90 798 594)" textAnchor="middle" fontSize="9" letterSpacing="2.5" fill={t.label} fillOpacity="0.4">EXIT</text>
      <text x="798" y="762" transform="rotate(90 798 762)" textAnchor="middle" fontSize="9" letterSpacing="2.5" fill={t.label} fillOpacity="0.4">ENTRANCE</text>
      <g stroke={accent} strokeOpacity="0.6" fill="none" strokeWidth="1.5">
        <circle cx="38" cy="840" r="5" /><rect x="31" y="849" width="14" height="17" rx="4" /><circle cx="60" cy="840" r="5" /><path d="M52 866 L60 849 L68 866 Z" strokeLinejoin="round" />
      </g>
      <line x1="10" y1="288" x2="372" y2="288" stroke="url(#aria-level-top)" strokeWidth="2" />
      <line x1="10" y1="292" x2="372" y2="292" stroke="url(#aria-level-top)" strokeWidth="1" opacity="0.4" />
      <line x1="99" y1="630" x2="372" y2="630" stroke="url(#aria-level-bottom)" strokeWidth="2" />
      <line x1="99" y1="634" x2="372" y2="634" stroke="url(#aria-level-bottom)" strokeWidth="1" opacity="0.4" />
      <rect x="170" y="340" width="86" height="156" rx="43" fill={t.fill} fillOpacity={t.fillOpacity} stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.5" />
      <rect x="192" y="362" width="42" height="112" rx="21" fill="none" stroke={t.backdrop} strokeOpacity={t.backdropOpacity} strokeWidth="1.5" />
      <image href="/images/logo-watermark.png" x="70" y="640" width="274" height="156" opacity="0.12" preserveAspectRatio="xMidYMid meet" />

      {ARIA_TABLES.map((geometry) => {
        const table = packageByCode.get(geometry.table_code)
        // Geometry entries only render when this event actually has a
        // matching package — lets different events use different subsets
        // of the shared geometry catalog (e.g. a one-off custom layout)
        // without phantom/overlapping shapes for codes they don't use.
        if (!table) return null
        const isSelected = geometry.table_code === selectedCode
        const selectable = onSelect ? (isSelectable ? isSelectable(table) : true) : false
        const isRound = geometry.table_kind === 'round'
        const { fill, fillOpacity, stroke, strokeOpacity } = getTableStyle(table, isSelected)

        return (
          <g
            key={geometry.table_code}
            role={onSelect ? 'button' : undefined}
            tabIndex={selectable ? 0 : undefined}
            aria-label={`${geometry.table_code}, ${tableStateLabel(table)}`}
            aria-pressed={onSelect ? isSelected : undefined}
            onClick={selectable ? () => onSelect?.(geometry.table_code) : undefined}
            onKeyDown={
              selectable
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onSelect?.(geometry.table_code)
                    }
                  }
                : undefined
            }
            className={selectable ? 'cursor-pointer outline-none' : undefined}
          >
            {isRound ? (
              <ellipse cx={geometry.x + geometry.width / 2} cy={geometry.y + geometry.height / 2} rx={geometry.width / 2} ry={geometry.height / 2} fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth={isSelected ? 2.5 : 1.5} />
            ) : (
              <rect x={geometry.x} y={geometry.y} width={geometry.width} height={geometry.height} rx={geometry.table_kind === 'section' ? 6 : 3} fill={fill} fillOpacity={fillOpacity} stroke={stroke} strokeOpacity={strokeOpacity} strokeWidth={isSelected ? 2.5 : 1.5} strokeDasharray={geometry.table_kind === 'section' ? '6 4' : undefined} />
            )}
            <text x={geometry.x + geometry.width / 2} y={geometry.y + geometry.height / 2 + 4} textAnchor="middle" fontSize={geometry.width < 55 ? 10 : 12} fontWeight="700" letterSpacing="1" fill={isSelected ? t.selectedLabel : t.label} fillOpacity={0.9}>{geometry.table_code}</text>
          </g>
        )
      })}
    </svg>
  )
}
