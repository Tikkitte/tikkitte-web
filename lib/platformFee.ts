const DEFAULT_PLATFORM_FEE_PERCENT = Number(process.env.PLATFORM_FEE_PERCENT ?? '5')

// Returns a percent (e.g. 5, not 0.05) — callers keep their own /100 conversion.
export function resolvePlatformFeePercent(organizerOverride: number | null | undefined): number {
  if (typeof organizerOverride === 'number' && Number.isFinite(organizerOverride)) return organizerOverride
  return Number.isFinite(DEFAULT_PLATFORM_FEE_PERCENT) ? DEFAULT_PLATFORM_FEE_PERCENT : 5
}
