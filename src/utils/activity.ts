export type ActivityKind = 'review' | 'lesson' | 'tsume' | 'tesuji' | 'game'
export type DayLog = Partial<Record<ActivityKind, number>>

const KEY = 'joseki-practice:activity:v1'
const KEEP_DAYS = 400

const pad = (n: number) => String(n).padStart(2, '0')

export const dayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const shift = (key: string, days: number) => {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d + days))
}

export function loadActivity(): Record<string, DayLog> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function logActivity(kind: ActivityKind, count = 1, now = new Date()) {
  const log = loadActivity()
  const key = dayKey(now)
  log[key] = { ...log[key], [kind]: (log[key]?.[kind] ?? 0) + count }
  const keep = Object.keys(log).sort().slice(-KEEP_DAYS)
  const trimmed = Object.fromEntries(keep.map((k) => [k, log[k]]))
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed))
  } catch (error) {
    console.warn('activity not persisted', error)
  }
}

export const dayTotal = (day: DayLog | undefined) => Object.values(day ?? {}).reduce((a, b) => a + (b ?? 0), 0)

/**
 * Consecutive practice days ending today. A streak stays alive through today
 * if you have not practised yet but did yesterday, so opening the app in the
 * morning never shows a broken streak.
 */
export function streakOf(log: Record<string, DayLog>, now = new Date()) {
  const today = dayKey(now)
  const practised = (key: string) => dayTotal(log[key]) > 0
  let cursor = practised(today) ? today : shift(today, -1)
  let days = 0
  while (practised(cursor)) {
    days++
    cursor = shift(cursor, -1)
  }
  return { days, today: practised(today) }
}

/** Practice counts for the last `days` days, oldest first. */
export function recentDays(log: Record<string, DayLog>, days = 14, now = new Date()) {
  const today = dayKey(now)
  return Array.from({ length: days }, (_, i) => {
    const key = shift(today, i - days + 1)
    return { key, total: dayTotal(log[key]) }
  })
}
