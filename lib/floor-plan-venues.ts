import type { Event, TablePackage } from '@/lib/types'
import { ARIA_CANVAS_HEIGHT, ARIA_CANVAS_WIDTH, ARIA_TABLES } from '@/lib/aria-tables'
import { ENZO_CANVAS_HEIGHT, ENZO_CANVAS_WIDTH, ENZO_TABLES } from '@/lib/enzo-tables'

// Venues with a verified location and a bookable table floor plan. The keys
// are the values allowed in event.floor_plan_venue. Adding a venue also needs
// a database migration (allowed key, name and Maps link in
// save_event_with_tickets, table preset in setup_aria_tables) and a backdrop
// in components/floor-plans.

export type FloorPlanVenueKey = NonNullable<Event['floor_plan_venue']>

export type TableGeometry = Pick<TablePackage, 'table_code' | 'table_kind'> & {
  x: number
  y: number
  width: number
  height: number
}

export type FloorPlanVenue = {
  key: FloorPlanVenueKey
  // The database stores this name and Maps link on the event
  // (save_event_with_tickets), so keep them identical to the migration.
  name: string
  mapsLink: string
  canvas: { width: number; height: number }
  // Every table position the plan can draw. An event only shows the codes
  // its own table packages use.
  tables: TableGeometry[]
  // Tables in the standard preset that setup_aria_tables() seeds.
  standardTableCount: number
}

export const FLOOR_PLAN_VENUES: readonly FloorPlanVenue[] = [
  {
    key: 'aria',
    name: 'Aria',
    mapsLink: 'https://maps.app.goo.gl/vUpGGgAAwqAgAEkP9?g_st=ipc',
    canvas: { width: ARIA_CANVAS_WIDTH, height: ARIA_CANVAS_HEIGHT },
    tables: ARIA_TABLES,
    standardTableCount: 24,
  },
  {
    key: 'enzo',
    name: 'Enzo',
    mapsLink: 'https://maps.app.goo.gl/DauUuzRt79X5qJFTA',
    canvas: { width: ENZO_CANVAS_WIDTH, height: ENZO_CANVAS_HEIGHT },
    tables: ENZO_TABLES,
    standardTableCount: 37,
  },
]

export function getFloorPlanVenue(key: string | null | undefined): FloorPlanVenue | null {
  return FLOOR_PLAN_VENUES.find((venue) => venue.key === key) ?? null
}

/** True when the name or link is one a preset venue fills in automatically. */
export function isPresetVenueValue(value: string) {
  return FLOOR_PLAN_VENUES.some((venue) => venue.name === value || venue.mapsLink === value)
}
