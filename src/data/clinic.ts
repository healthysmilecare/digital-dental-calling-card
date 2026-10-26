/**
 * Single source of truth for clinic information shown across the site.
 * Values marked DEMO are placeholders for presentation and should be replaced
 * with real data before launch.
 */
import type { DayHours, Weekday } from '../lib/time'

export const CLINIC = {
  name: 'Healthy Smile Care Dental Clinic',
  shortName: 'Healthy Smile Care',
  tagline: 'Gentle, modern dentistry for every smile.',
  address: 'Kuala Lumpur',
  /** IANA time zone used for "open now" and appointment slot calculations. */
  timeZone: 'Asia/Kuala_Lumpur',
  /** DEMO: placeholder founding date. */
  establishedYear: 2016,
  establishedMonth: 'March',
  doctor: {
    fullName: 'Stiffany Faith Sitoy',
    title: 'DMD',
    role: 'Doctor of Dental Medicine · Clinic Director',
    /** DEMO: placeholder biography for presentation. */
    bio: 'Dr. Sitoy believes a visit to the dentist should feel calm, honest and unhurried. She focuses on preventive care and minimally invasive treatments, explaining every step so patients always know what to expect.',
  },
  contact: {
    phoneDisplay: '0912 345 6789',
    /** E.164 form of 0912 345 6789 (Philippine mobile). */
    phoneHref: 'tel:+639123456789',
    email: 'dentalclinic@uv.com',
  },
} as const

/**
 * Weekly opening hours in minutes from midnight (clinic local time).
 * `null` means closed for the whole day. 0 = Sunday … 6 = Saturday.
 */
export const WEEKLY_HOURS: Readonly<Record<Weekday, DayHours | null>> = {
  0: null,
  1: { open: 9 * 60, close: 18 * 60, breakStart: 12 * 60, breakEnd: 13 * 60 },
  2: { open: 9 * 60, close: 18 * 60, breakStart: 12 * 60, breakEnd: 13 * 60 },
  3: { open: 9 * 60, close: 18 * 60, breakStart: 12 * 60, breakEnd: 13 * 60 },
  4: { open: 9 * 60, close: 18 * 60, breakStart: 12 * 60, breakEnd: 13 * 60 },
  5: { open: 9 * 60, close: 18 * 60, breakStart: 12 * 60, breakEnd: 13 * 60 },
  6: { open: 9 * 60, close: 15 * 60 },
}

/** Appointment slot granularity in minutes. */
export const SLOT_STEP_MINUTES = 30
/** Earliest same-day booking lead time in minutes. */
export const BOOKING_LEAD_MINUTES = 60
/** How far ahead patients may book, in days. */
export const BOOKING_HORIZON_DAYS = 60

export type ServiceCategory =
  | 'Preventive'
  | 'Restorative'
  | 'Cosmetic'
  | 'Orthodontics'
  | 'Surgery'

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  /** Price in Philippine pesos. DEMO values. */
  price: number
  /** Shown as "from ₱…" when the final price depends on the case. */
  priceFrom: boolean
  /** Appointment length in minutes; used to block slots. */
  durationMinutes: number
  description: string
  icon: ServiceIcon
  popular?: boolean
}

export type ServiceIcon =
  | 'tooth'
  | 'sparkle'
  | 'shield'
  | 'drill'
  | 'crown'
  | 'braces'
  | 'xray'
  | 'root'
  | 'extract'
  | 'implant'
  | 'denture'
  | 'child'

export const SERVICE_CATEGORIES: readonly ServiceCategory[] = [
  'Preventive',
  'Restorative',
  'Cosmetic',
  'Orthodontics',
  'Surgery',
]

/** DEMO: representative services and peso prices for presentation. */
export const SERVICES: readonly Service[] = [
  {
    id: 'consultation',
    name: 'Consultation & Check-up',
    category: 'Preventive',
    price: 500,
    priceFrom: false,
    durationMinutes: 30,
    description: 'A thorough oral examination, treatment planning and honest advice on what your smile needs.',
    icon: 'tooth',
  },
  {
    id: 'cleaning',
    name: 'Oral Prophylaxis (Cleaning)',
    category: 'Preventive',
    price: 1200,
    priceFrom: false,
    durationMinutes: 45,
    description: 'Gentle scaling and polishing to remove plaque, tartar and surface stains.',
    icon: 'sparkle',
    popular: true,
  },
  {
    id: 'fluoride',
    name: 'Fluoride Treatment',
    category: 'Preventive',
    price: 800,
    priceFrom: false,
    durationMinutes: 30,
    description: 'Strengthens enamel and helps prevent cavities. Ideal for children and cavity-prone adults.',
    icon: 'shield',
  },
  {
    id: 'xray',
    name: 'Digital X-ray',
    category: 'Preventive',
    price: 600,
    priceFrom: false,
    durationMinutes: 30,
    description: 'Low-dose digital imaging for accurate diagnosis of what the eye cannot see.',
    icon: 'xray',
  },
  {
    id: 'filling',
    name: 'Tooth-coloured Filling',
    category: 'Restorative',
    price: 1500,
    priceFrom: true,
    durationMinutes: 60,
    description: 'Composite fillings that blend naturally with your teeth. Price per tooth.',
    icon: 'drill',
    popular: true,
  },
  {
    id: 'root-canal',
    name: 'Root Canal Therapy',
    category: 'Restorative',
    price: 8000,
    priceFrom: true,
    durationMinutes: 90,
    description: 'Saves a badly infected tooth and relieves pain, so you can keep your natural smile.',
    icon: 'root',
  },
  {
    id: 'crown',
    name: 'Porcelain Crown',
    category: 'Restorative',
    price: 12000,
    priceFrom: true,
    durationMinutes: 90,
    description: 'A durable, natural-looking cap that restores a weakened or broken tooth.',
    icon: 'crown',
  },
  {
    id: 'dentures',
    name: 'Dentures',
    category: 'Restorative',
    price: 20000,
    priceFrom: true,
    durationMinutes: 60,
    description: 'Comfortable partial or complete dentures custom-fitted for everyday confidence.',
    icon: 'denture',
  },
  {
    id: 'whitening',
    name: 'Teeth Whitening',
    category: 'Cosmetic',
    price: 15000,
    priceFrom: false,
    durationMinutes: 90,
    description: 'In-clinic professional whitening for a visibly brighter smile in a single visit.',
    icon: 'sparkle',
    popular: true,
  },
  {
    id: 'veneers',
    name: 'Porcelain Veneers',
    category: 'Cosmetic',
    price: 10000,
    priceFrom: true,
    durationMinutes: 90,
    description: 'Ultra-thin shells that reshape and brighten front teeth. Price per tooth.',
    icon: 'tooth',
  },
  {
    id: 'braces',
    name: 'Metal Braces Package',
    category: 'Orthodontics',
    price: 45000,
    priceFrom: true,
    durationMinutes: 60,
    description: 'Complete orthodontic treatment with monthly adjustments included.',
    icon: 'braces',
  },
  {
    id: 'clear-aligners',
    name: 'Clear Aligners',
    category: 'Orthodontics',
    price: 120000,
    priceFrom: true,
    durationMinutes: 60,
    description: 'Nearly invisible, removable aligners for discreet straightening.',
    icon: 'braces',
  },
  {
    id: 'extraction',
    name: 'Tooth Extraction',
    category: 'Surgery',
    price: 1500,
    priceFrom: true,
    durationMinutes: 45,
    description: 'Safe, comfortable removal of damaged or problematic teeth with local anaesthesia.',
    icon: 'extract',
  },
  {
    id: 'implant',
    name: 'Dental Implant',
    category: 'Surgery',
    price: 75000,
    priceFrom: true,
    durationMinutes: 120,
    description: 'A permanent, natural-feeling replacement for a missing tooth.',
    icon: 'implant',
  },
  {
    id: 'pediatric',
    name: 'Kids Dental Visit',
    category: 'Preventive',
    price: 900,
    priceFrom: false,
    durationMinutes: 45,
    description: 'A friendly first visit with cleaning, check-up and a sticker for bravery.',
    icon: 'child',
  },
]

export function findService(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id)
}

const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
})

export function formatPeso(amount: number): string {
  return pesoFormatter.format(amount)
}
