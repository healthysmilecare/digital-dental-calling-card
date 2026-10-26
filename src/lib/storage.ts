/**
 * Appointment persistence.
 *
 * DEMO MODE: appointments live in the visitor's own browser (localStorage).
 * Nothing is sent anywhere. When a backend is added, this module is the only
 * place that needs to change.
 *
 * Every read is validated field-by-field — localStorage is writable by any
 * script on the origin and by the user, so its contents are untrusted input.
 */
import { parseIsoDate, type IsoDate } from './time'
import { LIMITS } from './validation'

export interface Appointment {
  id: string
  /** Short human-friendly reference shown to the patient. */
  reference: string
  serviceId: string
  date: IsoDate
  /** Minutes from midnight (clinic local time). */
  start: number
  durationMinutes: number
  name: string
  phone: string
  email: string
  notes: string
  /** ISO 8601 timestamp. */
  createdAt: string
}

const STORAGE_KEY = 'hsc.appointments.v1'
const MAX_RECORDS = 200

let memoryFallback: Appointment[] = []

function getStore(): Storage | null {
  try {
    const store = window.localStorage
    const probe = '__hsc_probe__'
    store.setItem(probe, '1')
    store.removeItem(probe)
    return store
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isString(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length <= max
}

function isMinute(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value < 24 * 60
}

/** Validate an unknown value as an Appointment. Returns null when malformed. */
export function toAppointment(value: unknown): Appointment | null {
  if (!isRecord(value)) return null
  const {
    id,
    reference,
    serviceId,
    date,
    start,
    durationMinutes,
    name,
    phone,
    email,
    notes,
    createdAt,
  } = value

  if (!isString(id, 64) || id.length === 0) return null
  if (!isString(reference, 16) || reference.length === 0) return null
  if (!isString(serviceId, 64) || serviceId.length === 0) return null
  if (!isString(date, 10) || parseIsoDate(date) === null) return null
  if (!isMinute(start)) return null
  if (
    typeof durationMinutes !== 'number' ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0 ||
    durationMinutes > 8 * 60
  ) {
    return null
  }
  if (!isString(name, LIMITS.nameMax)) return null
  if (!isString(phone, 20)) return null
  if (!isString(email, LIMITS.emailMax)) return null
  if (!isString(notes, LIMITS.notesMax)) return null
  if (!isString(createdAt, 40) || Number.isNaN(Date.parse(createdAt))) return null

  return {
    id,
    reference,
    serviceId,
    date,
    start,
    durationMinutes,
    name,
    phone,
    email,
    notes,
    createdAt,
  }
}

export function loadAppointments(): Appointment[] {
  const store = getStore()
  if (!store) return [...memoryFallback]

  let raw: string | null = null
  try {
    raw = store.getItem(STORAGE_KEY)
  } catch {
    return []
  }
  if (!raw) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const valid: Appointment[] = []
  for (const item of parsed.slice(0, MAX_RECORDS)) {
    const appt = toAppointment(item)
    if (appt) valid.push(appt)
  }
  return valid
}

export function saveAppointments(list: readonly Appointment[]): boolean {
  const trimmed = list.slice(-MAX_RECORDS)
  const store = getStore()
  if (!store) {
    memoryFallback = [...trimmed]
    return true
  }
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(trimmed))
    return true
  } catch {
    // Quota exceeded or storage disabled mid-session.
    memoryFallback = [...trimmed]
    return false
  }
}

/* ------------------------------------------------------------------ */
/* Identifiers                                                          */
/* ------------------------------------------------------------------ */

const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I

export function generateReference(): string {
  const bytes = new Uint8Array(6)
  crypto.getRandomValues(bytes)
  let out = ''
  for (const b of bytes) out += REFERENCE_ALPHABET[b % REFERENCE_ALPHABET.length]
  return `HSC-${out}`
}

export function generateId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
