export function formatNumber(value: number): string {
  return new Intl.NumberFormat('he-IL').format(value)
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('he-IL').format(new Date(iso))
}
