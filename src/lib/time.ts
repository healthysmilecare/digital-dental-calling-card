/**
 * Pure date/time helpers. Everything here is deterministic and framework-free
 * so it can be unit-tested and reused by a future backend.
 */

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface DayHours {
  /** Minutes from midnight. */
  open: number
  close: number
  breakStart?: number
  breakEnd?: number
}

export interface ZonedParts {
  year: number
  /** 1–12 */
  month: number
  day: number
  weekday: Weekday
  hour: number
  minute: number
}

export const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

export const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const WEEKDAY_LOOKUP: Record<string, Weekday> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
}

const partsFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  let fmt = partsFormatterCache.get(timeZone)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    })
    partsFormatterCache.set(timeZone, fmt)
  }
  return fmt
}

/** Break a Date down into wall-clock parts in the given IANA time zone. */
export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const parts = getPartsFormatter(timeZone).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? ''

  const weekday = WEEKDAY_LOOKUP[get('weekday')] ?? 0
  // Some engines report midnight as "24" even with h23; normalise.
  const hour = Number(get('hour')) % 24

  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    weekday,
    hour,
    minute: Number(get('minute')),
  }
}

export function minutesOfDay(parts: ZonedParts): number {
  return parts.hour * 60 + parts.minute
}

/** 540 -> "9:00 AM" */
export function formatMinutes(total: number): string {
  const h24 = Math.floor(total / 60) % 24
  const m = total % 60
  const suffix = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`
}

export function formatHoursRange(hours: DayHours | null): string {
  if (!hours) return 'Closed'
  return `${formatMinutes(hours.open)} – ${formatMinutes(hours.close)}`
}

/* ------------------------------------------------------------------ */
/* ISO date strings (YYYY-MM-DD), used as the canonical date key        */
/* ------------------------------------------------------------------ */

export type IsoDate = string

const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function toIsoDate(year: number, month: number, day: number): IsoDate {
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
    .toString()
    .padStart(2, '0')}`
}

export interface CalendarDate {
  year: number
  month: number
  day: number
}

/** Strictly parse and validate a YYYY-MM-DD string. Returns null when invalid. */
export function parseIsoDate(value: string): CalendarDate | null {
  const match = ISO_DATE_RE.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12) return null
  if (day < 1 || day > daysInMonth(year, month)) return null
  return { year, month, day }
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

/** Weekday for a calendar date, independent of the viewer's time zone. */
export function weekdayOf(date: CalendarDate): Weekday {
  return new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay() as Weekday
}

/** Days from `a` to `b` (positive when b is later). */
export function diffDays(a: CalendarDate, b: CalendarDate): number {
  const ua = Date.UTC(a.year, a.month - 1, a.day)
  const ub = Date.UTC(b.year, b.month - 1, b.day)
  return Math.round((ub - ua) / 86_400_000)
}

export function addDays(date: CalendarDate, days: number): CalendarDate {
  const d = new Date(Date.UTC(date.year, date.month - 1, date.day + days))
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return diffDays(b, a)
}

export function formatLongDate(date: CalendarDate): string {
  const weekday = WEEKDAY_NAMES[weekdayOf(date)]
  const month = MONTH_NAMES[date.month - 1]
  return `${weekday}, ${month} ${date.day}, ${date.year}`
}

export function formatShortDate(date: CalendarDate): string {
  const month = MONTH_NAMES[date.month - 1]?.slice(0, 3)
  return `${WEEKDAY_SHORT[weekdayOf(date)]}, ${month} ${date.day}`
}

/* ------------------------------------------------------------------ */
/* Open / closed status                                                 */
/* ------------------------------------------------------------------ */

export type OpenState = 'open' | 'closing-soon' | 'break' | 'closed'

export interface OpenStatus {
  state: OpenState
  headline: string
  detail: string
}

export function getOpenStatus(
  parts: ZonedParts,
  weekly: Readonly<Record<Weekday, DayHours | null>>,
): OpenStatus {
  const today = weekly[parts.weekday]
  const now = minutesOfDay(parts)

  if (today) {
    if (now < today.open) {
      return {
        state: 'closed',
        headline: 'Closed right now',
        detail: `Opens today at ${formatMinutes(today.open)}`,
      }
    }
    if (
      today.breakStart !== undefined &&
      today.breakEnd !== undefined &&
      now >= today.breakStart &&
      now < today.breakEnd
    ) {
      return {
        state: 'break',
        headline: 'On lunch break',
        detail: `Back at ${formatMinutes(today.breakEnd)}`,
      }
    }
    if (now < today.close) {
      const remaining = today.close - now
      return {
        state: remaining <= 60 ? 'closing-soon' : 'open',
        headline: remaining <= 60 ? 'Closing soon' : 'Open now',
        detail: `Closes at ${formatMinutes(today.close)}`,
      }
    }
  }

  // Closed for the rest of today: find the next open day.
  for (let offset = 1; offset <= 7; offset += 1) {
    const weekday = ((parts.weekday + offset) % 7) as Weekday
    const hours = weekly[weekday]
    if (hours) {
      const dayLabel = offset === 1 ? 'tomorrow' : `on ${WEEKDAY_NAMES[weekday]}`
      return {
        state: 'closed',
        headline: 'Closed right now',
        detail: `Opens ${dayLabel} at ${formatMinutes(hours.open)}`,
      }
    }
  }

  return { state: 'closed', headline: 'Closed', detail: 'No opening hours set' }
}

/* ------------------------------------------------------------------ */
/* Appointment slots                                                    */
/* ------------------------------------------------------------------ */

export interface BusyInterval {
  /** Minutes from midnight. */
  start: number
  duration: number
}

export interface SlotOptions {
  hours: DayHours
  durationMinutes: number
  stepMinutes: number
  /** Slots starting before this minute are excluded (for same-day bookings). */
  notBefore?: number
  busy?: readonly BusyInterval[]
}

export interface Slot {
  start: number
  available: boolean
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && aEnd > bStart
}

/**
 * Generate every slot start for a day. A slot must fit entirely inside the
 * opening hours and must not cross the lunch break. Slots that collide with a
 * busy interval are returned with `available: false` so the UI can show them
 * as taken rather than silently hiding them.
 */
export function generateSlots(opts: SlotOptions): Slot[] {
  const { hours, durationMinutes, stepMinutes, notBefore, busy = [] } = opts
  if (durationMinutes <= 0 || stepMinutes <= 0) return []

  const slots: Slot[] = []
  for (let start = hours.open; start + durationMinutes <= hours.close; start += stepMinutes) {
    const end = start + durationMinutes

    if (
      hours.breakStart !== undefined &&
      hours.breakEnd !== undefined &&
      overlaps(start, end, hours.breakStart, hours.breakEnd)
    ) {
      continue
    }

    if (notBefore !== undefined && start < notBefore) continue

    const taken = busy.some((b) => overlaps(start, end, b.start, b.start + b.duration))
    slots.push({ start, available: !taken })
  }
  return slots
}

/**
 * DEMO: deterministic pseudo-random "already booked" intervals so the slot
 * grid looks realistic without a backend. Replace with real availability.
 */
export function demoBusyIntervals(isoDate: IsoDate, hours: DayHours): BusyInterval[] {
  let hash = 2166136261
  for (let i = 0; i < isoDate.length; i += 1) {
    hash ^= isoDate.charCodeAt(i)
    hash = Math.imul(hash, 16777619) >>> 0
  }
  const span = hours.close - hours.open
  const count = 2 + (hash % 3) // 2–4 busy blocks
  const result: BusyInterval[] = []
  for (let i = 0; i < count; i += 1) {
    hash = Math.imul(hash ^ (hash >>> 13), 1274126177) >>> 0
    const offset = Math.floor((hash % span) / 30) * 30
    result.push({ start: hours.open + offset, duration: 30 + (hash % 2) * 30 })
  }
  return result
}
