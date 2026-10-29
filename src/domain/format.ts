export function formatNumber(value: number): string {
  return new Intl.NumberFormat('he-IL').format(value)
}
