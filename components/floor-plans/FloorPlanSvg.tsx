'use client'

import type { ComponentType } from 'react'
import { ARIA_ACCENT } from '@/lib/aria-tables'
import { getFloorPlanVenue, type FloorPlanVenueKey } from '@/lib/floor-plan-venues'
import type { TablePackage } from '@/lib/types'
import AriaBackdrop from './AriaBackdrop'
import EnzoBackdrop from './EnzoBackdrop'
import { FLOOR_PLAN_THEMES, type BackdropProps, type FloorPlanTheme } from './theme'

/** Hatched fill for tables guests can't pick. */
export const UNAVAILABLE_TABLE_FILL = 'url(#floor-plan-unavailable)'

const BACKDROPS: Record<FloorPlanVenueKey, ComponentType<BackdropProps>> = {
  aria: AriaBackdrop,
  enzo: EnzoBackdrop,
}

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
  venue: FloorPlanVenueKey
  packages: TablePackage[]
  selectedCode?: string | null
  onSelect?: (code: string) => void
  isSelectable?: (table: TablePackage | undefined) => boolean
  getTableStyle: (table: TablePackage | undefined, isSelected: boolean) => TableStyle
  className?: string
  theme?: FloorPlanTheme
  accentColor?: string
}

export default function FloorPlanSvg({
  venue: venueKey,
  packages,
  selectedCode = null,
  onSelect,
  isSelectable,
  getTableStyle,
  className,
  theme = 'dark',
  accentColor,
}: Props) {
  const venue = getFloorPlanVenue(venueKey)
  if (!venue) return null

  const Backdrop = BACKDROPS[venue.key]
  const packageByCode = new Map(packages.map((table) => [table.table_code, table]))
  const accent = accentColor ?? ARIA_ACCENT
  const t = FLOOR_PLAN_THEMES[theme]

  return (
    <svg
      viewBox={`0 0 ${venue.canvas.width} ${venue.canvas.height}`}
      className={className ?? 'h-auto w-full'}
      role="img"
      aria-label={`${venue.name} table layout`}
    >
      <defs>
        <pattern id="floor-plan-unavailable" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" stroke={t.backdrop} strokeOpacity={theme === 'dark' ? 0.1 : 0.12} strokeWidth="4" />
        </pattern>
      </defs>

      <Backdrop t={t} accent={accent} />

      {venue.tables.map((geometry) => {
        const table = packageByCode.get(geometry.table_code)
        // Geometry entries only render when this event actually has a
        // matching package, so different events can use different subsets
        // of a venue's geometry catalog (e.g. a one-off custom layout)
        // without phantom or overlapping shapes for codes they don't use.
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
