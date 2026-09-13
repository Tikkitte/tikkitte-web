export function formatCents(value: number) {
  return `GHS ${(value / 100).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
