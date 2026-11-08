export const MAX_RANGE_DAYS = 366

export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDays(day: string, amount: number): string {
  const next = Date.parse(`${day}T00:00:00Z`) + amount * 86_400_000
  return new Date(next).toISOString().slice(0, 10)
}

export function validDay(day: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false
  const parsed = new Date(`${day}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === day
}

export function daysBetween(start: string, end: string): number {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000)
}

export function eachDay(start: string, end: string): string[] {
  const days: string[] = []
  let cursor = start
  while (cursor <= end) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
    if (days.length > MAX_RANGE_DAYS) break
  }
  return days
}

export function defaultRange(now: Date): { from: string; to: string } {
  const to = utcDay(now)
  return { from: addDays(to, -27), to }
}

export function parseRange(
  from: string | undefined,
  to: string | undefined,
  now: Date,
): { from: string; to: string } | { error: 'bad-date' | 'bad-range' | 'range-too-long' } {
  const today = utcDay(now)
  const end = to === undefined || to === '' ? today : to
  const start = from === undefined || from === '' ? addDays(end, -27) : from
  if (!validDay(start) || !validDay(end)) return { error: 'bad-date' }
  if (start > end || end > today) return { error: 'bad-range' }
  if (daysBetween(start, end) + 1 > MAX_RANGE_DAYS) return { error: 'range-too-long' }
  return { from: start, to: end }
}
