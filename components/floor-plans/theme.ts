export const FLOOR_PLAN_THEMES = {
  // The original nightclub backdrop.
  dark: { backdrop: '#D7E6EE', backdropOpacity: 0.4, fill: '#DCEBF0', fillOpacity: 0.03, label: '#E4EEF4', selectedLabel: '#06232b' },
  // The cream/ink Gallery look.
  light: { backdrop: 'rgba(23,17,14,0.55)', backdropOpacity: 1, fill: 'rgba(23,17,14,0.02)', fillOpacity: 1, label: '#17110E', selectedLabel: '#FDFCFA' },
}

export type FloorPlanTheme = keyof typeof FLOOR_PLAN_THEMES
export type FloorPlanTokens = (typeof FLOOR_PLAN_THEMES)[FloorPlanTheme]

/** Props every venue backdrop (walls, stage, bar, labels) receives. */
export type BackdropProps = {
  t: FloorPlanTokens
  accent: string
}
