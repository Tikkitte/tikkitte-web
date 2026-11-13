import type { TableGeometry } from '@/lib/floor-plan-venues'

// Measured from Enzo's floor plan drawing (840 x 1064). Table codes must match
// the Enzo preset in setup_aria_tables().
export const ENZO_CANVAS_WIDTH = 840
export const ENZO_CANVAS_HEIGHT = 1064

// Raised platform booths along the right wall.
const PLATFORM_Y = [35, 178, 321, 464, 607, 750]
// Side sections under the mezzanine along the left wall.
const SIDE_Y = [103, 204, 306, 407, 508, 609, 710]
// Floor tables: four per row, six rows, numbered left to right from the stage.
const FLOOR_X = [181, 291, 401, 511]
const FLOOR_Y = [210, 309, 408, 529, 628, 727]

export const ENZO_TABLES: TableGeometry[] = [
  ...PLATFORM_Y.map((y, index) => ({
    table_code: `V${index + 1}`,
    table_kind: 'section' as const,
    x: 695,
    y,
    width: 101,
    height: 132,
  })),
  ...SIDE_Y.map((y, index) => ({
    table_code: `S${index + 1}`,
    table_kind: 'section' as const,
    x: 43,
    y,
    width: 84,
    height: 92,
  })),
  ...FLOOR_Y.flatMap((y, row) =>
    FLOOR_X.map((x, column) => ({
      table_code: `F${row * FLOOR_X.length + column + 1}`,
      table_kind: 'floor' as const,
      x,
      y,
      width: 95,
      height: 77,
    })),
  ),
]
