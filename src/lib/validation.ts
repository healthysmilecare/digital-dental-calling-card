/**
 * Input validation for the appointment form.
 *
 * All validators normalise their input (trim / collapse whitespace) and return
 * either a cleaned value or a human-readable error. Nothing here trusts the
 * caller: the same rules must be re-applied on the server once one exists.
 */

export const LIMITS = {
  nameMin: 2,
  nameMax: 60,
  emailMax: 254,
  notesMax: 300,
} as const

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string }

/** Letters (any script), spaces, hyphens, apostrophes and periods. */
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u

export function validateName(raw: string): ValidationResult<string> {
  const value = collapseWhitespace(raw)
  if (value.length === 0) return { ok: false, error: 'Please enter your full name.' }
  if (value.length < LIMITS.nameMin) return { ok: false, error: 'Name is too short.' }
  if (value.length > LIMITS.nameMax) {
    return { ok: false, error: `Name must be ${LIMITS.nameMax} characters or fewer.` }
  }
  if (!NAME_RE.test(value)) {
    return { ok: false, error: 'Name may only contain letters, spaces, hyphens and apostrophes.' }
  }
  return { ok: true, value }
}

/**
 * Philippine mobile numbers: 09XXXXXXXXX or +639XXXXXXXXX.
 * Spaces, dashes and dots are ignored. Normalised to 09XXXXXXXXX.
 */
const PH_MOBILE_RE = /^(?:\+?63|0)(9\d{9})$/

export function validatePhone(raw: string): ValidationResult<string> {
  const compact = raw.replace(/[\s().-]/g, '')
  if (compact.length === 0) return { ok: false, error: 'Please enter your mobile number.' }
  const match = PH_MOBILE_RE.exec(compact)
  if (!match || !match[1]) {
    return { ok: false, error: 'Enter a valid mobile number, e.g. 0912 345 6789.' }
  }
  return { ok: true, value: `0${match[1]}` }
}

/** Pragmatic email check: one @, no spaces, a dot in the domain, sane length. */
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(?:\.[^\s@.]+)+$/

export function validateEmail(raw: string): ValidationResult<string> {
  const value = raw.trim().toLowerCase()
  if (value.length === 0) return { ok: false, error: 'Please enter your email address.' }
  if (value.length > LIMITS.emailMax || !EMAIL_RE.test(value)) {
    return { ok: false, error: 'Enter a valid email address.' }
  }
  return { ok: true, value }
}

export function validateNotes(raw: string): ValidationResult<string> {
  // Strip control characters except newlines, then trim.
  const value = raw.replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '').trim()
  if (value.length > LIMITS.notesMax) {
    return { ok: false, error: `Notes must be ${LIMITS.notesMax} characters or fewer.` }
  }
  return { ok: true, value }
}

export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

/** Format 09123456789 as 0912 345 6789 for display. */
export function formatPhoneDisplay(normalised: string): string {
  if (!/^09\d{9}$/.test(normalised)) return normalised
  return `${normalised.slice(0, 4)} ${normalised.slice(4, 7)} ${normalised.slice(7)}`
}
