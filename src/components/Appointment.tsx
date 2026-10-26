import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import {
  BOOKING_HORIZON_DAYS,
  BOOKING_LEAD_MINUTES,
  CLINIC,
  findService,
  formatPeso,
  SERVICES,
  SLOT_STEP_MINUTES,
  WEEKLY_HOURS,
} from '../data/clinic'
import { useNow } from '../hooks/useNow'
import {
  addDays,
  daysInMonth,
  demoBusyIntervals,
  diffDays,
  formatLongDate,
  formatMinutes,
  generateSlots,
  getZonedParts,
  minutesOfDay,
  MONTH_NAMES,
  parseIsoDate,
  toIsoDate,
  WEEKDAY_SHORT,
  weekdayOf,
  type BusyInterval,
  type CalendarDate,
  type IsoDate,
} from '../lib/time'
import {
  formatPhoneDisplay,
  LIMITS,
  validateEmail,
  validateName,
  validateNotes,
  validatePhone,
} from '../lib/validation'
import {
  generateId,
  generateReference,
  loadAppointments,
  saveAppointments,
  type Appointment as AppointmentRecord,
} from '../lib/storage'
import {
  AlertIcon,
  ArrowRightIcon,
  CalendarIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ServiceGlyph,
  ToothIcon,
  UserIcon,
} from './Icons'
import { Reveal } from './Reveal'

type Step = 1 | 2 | 3 | 'done'

interface FormState {
  name: string
  phone: string
  email: string
  notes: string
  consent: boolean
  /** Honeypot: humans never see or fill this. */
  website: string
}

type FormErrors = Partial<Record<keyof FormState, string>>

const EMPTY_FORM: FormState = {
  name: '',
  phone: '',
  email: '',
  notes: '',
  consent: false,
  website: '',
}

export interface BookingRequest {
  serviceId: string
  /** Changes on every request so the same service can be requested twice. */
  nonce: number
}

interface AppointmentProps {
  request: BookingRequest | null
}

const STEPS: { n: 1 | 2 | 3; label: string }[] = [
  { n: 1, label: 'Service' },
  { n: 2, label: 'Date & time' },
  { n: 3, label: 'Your details' },
]

export function Appointment({ request }: AppointmentProps) {
  const now = useNow(60_000)
  const nowParts = useMemo(() => getZonedParts(now, CLINIC.timeZone), [now])
  const today = useMemo<CalendarDate>(
    () => ({ year: nowParts.year, month: nowParts.month, day: nowParts.day }),
    [nowParts.year, nowParts.month, nowParts.day],
  )
  const maxDate = useMemo(() => addDays(today, BOOKING_HORIZON_DAYS), [today])

  const [step, setStep] = useState<Step>(1)
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<IsoDate | null>(null)
  const [slotStart, setSlotStart] = useState<number | null>(null)
  const [view, setView] = useState({ year: today.year, month: today.month })
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(() => loadAppointments())
  const [lastBooked, setLastBooked] = useState<AppointmentRecord | null>(null)
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)

  const titleRef = useRef<HTMLHeadingElement>(null)
  const lastNonce = useRef<number | null>(null)

  const service = serviceId ? findService(serviceId) : undefined
  const date = selectedDate ? parseIsoDate(selectedDate) : null

  // Apply "Book this service" requests coming from the Services section.
  useEffect(() => {
    if (!request || request.nonce === lastNonce.current) return
    lastNonce.current = request.nonce
    if (!findService(request.serviceId)) return
    setServiceId(request.serviceId)
    setSlotStart(null)
    setSubmitError(null)
    setLastBooked(null)
    setStep(2)
  }, [request])

  // Move focus to the panel heading whenever the step changes.
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: true })
  }, [step])

  // Busy intervals for the selected date: demo data + bookings saved in this browser.
  const busy = useMemo<BusyInterval[]>(() => {
    if (!selectedDate || !date) return []
    const hours = WEEKLY_HOURS[weekdayOf(date)]
    if (!hours) return []
    const stored = appointments
      .filter((a) => a.date === selectedDate)
      .map((a) => ({ start: a.start, duration: a.durationMinutes }))
    return [...demoBusyIntervals(selectedDate, hours), ...stored]
  }, [selectedDate, date, appointments])

  const slots = useMemo(() => {
    if (!date || !service) return []
    const hours = WEEKLY_HOURS[weekdayOf(date)]
    if (!hours) return []
    const isToday = diffDays(today, date) === 0
    return generateSlots({
      hours,
      durationMinutes: service.durationMinutes,
      stepMinutes: SLOT_STEP_MINUTES,
      busy,
      ...(isToday ? { notBefore: minutesOfDay(nowParts) + BOOKING_LEAD_MINUTES } : {}),
    })
  }, [date, service, busy, today, nowParts])

  const availableCount = slots.filter((s) => s.available).length

  function chooseService(id: string) {
    if (id !== serviceId) setSlotStart(null)
    setServiceId(id)
  }

  function chooseDate(iso: IsoDate) {
    setSelectedDate(iso)
    setSlotStart(null)
  }

  function isDayDisabled(d: CalendarDate): boolean {
    if (diffDays(today, d) < 0) return true
    if (diffDays(d, maxDate) < 0) return true
    return WEEKLY_HOURS[weekdayOf(d)] === null
  }

  function canGoPrevMonth(): boolean {
    return view.year > today.year || (view.year === today.year && view.month > today.month)
  }

  function canGoNextMonth(): boolean {
    return view.year < maxDate.year || (view.year === maxDate.year && view.month < maxDate.month)
  }

  function shiftMonth(delta: 1 | -1) {
    setView((v) => {
      let month = v.month + delta
      let year = v.year
      if (month < 1) {
        month = 12
        year -= 1
      } else if (month > 12) {
        month = 1
        year += 1
      }
      return { year, month }
    })
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)

    // Honeypot filled → almost certainly a bot. Fail quietly.
    if (form.website.trim().length > 0) return

    const nameRes = validateName(form.name)
    const phoneRes = validatePhone(form.phone)
    const emailRes = validateEmail(form.email)
    const notesRes = validateNotes(form.notes)

    const nextErrors: FormErrors = {}
    if (!nameRes.ok) nextErrors.name = nameRes.error
    if (!phoneRes.ok) nextErrors.phone = phoneRes.error
    if (!emailRes.ok) nextErrors.email = emailRes.error
    if (!notesRes.ok) nextErrors.notes = notesRes.error
    if (!form.consent) nextErrors.consent = 'Please confirm the details are correct.'

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }
    if (!nameRes.ok || !phoneRes.ok || !emailRes.ok || !notesRes.ok) return

    // Re-validate the schedule against current data, never trusting UI state alone.
    if (!service || !date || !selectedDate || slotStart === null) {
      setSubmitError('Please choose a service, date and time first.')
      setStep(service ? 2 : 1)
      return
    }
    if (isDayDisabled(date)) {
      setSubmitError('That date is no longer available. Please pick another day.')
      setStep(2)
      return
    }
    const chosen = slots.find((s) => s.start === slotStart)
    if (!chosen || !chosen.available) {
      setSubmitError('That time was just taken. Please choose another slot.')
      setSlotStart(null)
      setStep(2)
      return
    }

    const record: AppointmentRecord = {
      id: generateId(),
      reference: generateReference(),
      serviceId: service.id,
      date: selectedDate,
      start: slotStart,
      durationMinutes: service.durationMinutes,
      name: nameRes.value,
      phone: phoneRes.value,
      email: emailRes.value,
      notes: notesRes.value,
      createdAt: new Date().toISOString(),
    }

    const next = [...appointments, record]
    const persisted = saveAppointments(next)
    setAppointments(next)
    setLastBooked(record)
    setStep('done')
    if (!persisted) {
      setSubmitError(
        'Your booking is confirmed for this visit, but this browser could not save it for later.',
      )
    }
  }

  function resetFlow() {
    setStep(1)
    setServiceId(null)
    setSelectedDate(null)
    setSlotStart(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setSubmitError(null)
    setLastBooked(null)
    setView({ year: today.year, month: today.month })
  }

  function cancelAppointment(id: string) {
    const next = appointments.filter((a) => a.id !== id)
    saveAppointments(next)
    setAppointments(next)
    setConfirmCancelId(null)
  }

  const upcoming = useMemo(() => {
    return appointments
      .filter((a) => {
        const d = parseIsoDate(a.date)
        return d !== null && diffDays(today, d) >= 0
      })
      .sort((a, b) => (a.date === b.date ? a.start - b.start : a.date < b.date ? -1 : 1))
  }, [appointments, today])

  const stepIndex = step === 'done' ? 4 : step

  return (
    <section id="appointment" className="section section--tint" aria-labelledby="appointment-title">
      <div className="container">
        <Reveal>
          <div className="section__head">
            <span className="eyebrow">Book an appointment</span>
            <h2 id="appointment-title" className="h2">
              Pick a time that <span className="italic-accent">suits you</span>.
            </h2>
            <p className="lede">
              Choose a service, see live availability and reserve your seat in under a minute. We
              will confirm by text or email.
            </p>
          </div>
        </Reveal>

        <div className="booking">
          <Reveal>
            <div className="panel">
              {step !== 'done' ? (
                <ol className="steps" aria-label="Booking progress">
                  {STEPS.map((s) => {
                    const state = s.n === step ? 'active' : s.n < stepIndex ? 'done' : 'todo'
                    const reachable = s.n < stepIndex
                    return (
                      <li key={s.n} className={`step step--${state}`} aria-current={state === 'active' ? 'step' : undefined}>
                        {reachable ? (
                          <button type="button" onClick={() => setStep(s.n)} className="step__btn" aria-label={`Back to step ${s.n}: ${s.label}`}>
                            <span className="step__num">
                              <CheckIcon />
                            </span>
                            <span className="step__label">{s.label}</span>
                          </button>
                        ) : (
                          <>
                            <span className="step__num">{s.n}</span>
                            <span className="step__label">{s.label}</span>
                          </>
                        )}
                      </li>
                    )
                  })}
                </ol>
              ) : null}

              {submitError && step !== 'done' ? (
                <div className="alert alert--error" role="alert" style={{ marginBottom: 20 }}>
                  <AlertIcon />
                  <span>{submitError}</span>
                </div>
              ) : null}

              {step === 1 ? (
                <div>
                  <h3 className="panel__title" ref={titleRef} tabIndex={-1}>
                    What can we help you with?
                  </h3>
                  <p className="panel__hint">Select one service. You can add more during your visit.</p>

                  <div className="picker" role="radiogroup" aria-label="Service">
                    {SERVICES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        role="radio"
                        aria-checked={serviceId === s.id}
                        className="option"
                        onClick={() => chooseService(s.id)}
                      >
                        <span className="option__icon">
                          <ServiceGlyph icon={s.icon} />
                        </span>
                        <span className="option__body">
                          <span className="option__name">{s.name}</span>
                          <br />
                          <span className="option__meta">
                            {s.priceFrom ? 'from ' : ''}
                            {formatPeso(s.price)} · {s.durationMinutes} min
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="panel__actions">
                    <span />
                    <button
                      type="button"
                      className="btn btn--primary"
                      disabled={!service}
                      onClick={() => setStep(2)}
                    >
                      Choose date &amp; time
                      <ArrowRightIcon className="btn__icon" />
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 2 && service ? (
                <div>
                  <h3 className="panel__title" ref={titleRef} tabIndex={-1}>
                    When would you like to come in?
                  </h3>
                  <p className="panel__hint">
                    {service.name} takes about {service.durationMinutes} minutes. Bookings open up to{' '}
                    {BOOKING_HORIZON_DAYS} days ahead.
                  </p>

                  <div className="schedule">
                    <div>
                      <div className="cal__head">
                        <button
                          type="button"
                          className="cal__nav"
                          onClick={() => shiftMonth(-1)}
                          disabled={!canGoPrevMonth()}
                          aria-label="Previous month"
                        >
                          <ChevronLeftIcon />
                        </button>
                        <div className="cal__month" aria-live="polite">
                          {MONTH_NAMES[view.month - 1]} {view.year}
                        </div>
                        <button
                          type="button"
                          className="cal__nav"
                          onClick={() => shiftMonth(1)}
                          disabled={!canGoNextMonth()}
                          aria-label="Next month"
                        >
                          <ChevronRightIcon />
                        </button>
                      </div>

                      <div className="cal__grid" role="grid" aria-label="Choose a date">
                        {WEEKDAY_SHORT.map((d) => (
                          <div key={d} className="cal__dow" role="columnheader">
                            {d}
                          </div>
                        ))}
                        {Array.from({ length: weekdayOf({ year: view.year, month: view.month, day: 1 }) }).map(
                          (_, i) => <div key={`pad-${i}`} className="cal__empty" aria-hidden="true" />,
                        )}
                        {Array.from({ length: daysInMonth(view.year, view.month) }).map((_, i) => {
                          const d: CalendarDate = { year: view.year, month: view.month, day: i + 1 }
                          const iso = toIsoDate(d.year, d.month, d.day)
                          const disabled = isDayDisabled(d)
                          const isToday = diffDays(today, d) === 0
                          return (
                            <button
                              key={iso}
                              type="button"
                              role="gridcell"
                              className={`cal__day ${isToday ? 'cal__day--today' : ''}`}
                              disabled={disabled}
                              aria-pressed={selectedDate === iso}
                              aria-label={`${formatLongDate(d)}${disabled ? ', unavailable' : ''}`}
                              onClick={() => chooseDate(iso)}
                            >
                              {d.day}
                            </button>
                          )
                        })}
                      </div>
                      <div className="cal__legend" aria-hidden="true">
                        <span>Available</span>
                        <span className="legend--closed">Closed / past</span>
                        <span className="legend--selected">Selected</span>
                      </div>
                    </div>

                    <div>
                      <div className="slots__title">
                        <span style={{ color: 'var(--brown-900)', fontSize: 15, fontWeight: 700 }}>
                          {date ? formatLongDate(date) : 'Select a date'}
                        </span>
                        {date ? <span>{availableCount} open</span> : null}
                      </div>

                      {!date ? (
                        <div className="slots__empty">Pick a day on the calendar to see available times.</div>
                      ) : slots.length === 0 ? (
                        <div className="slots__empty">
                          No more slots today for this service. Please choose another day.
                        </div>
                      ) : (
                        <div className="slots" role="group" aria-label="Choose a time">
                          {slots.map((s) => (
                            <button
                              key={s.start}
                              type="button"
                              className="slot"
                              disabled={!s.available}
                              aria-pressed={slotStart === s.start}
                              aria-label={`${formatMinutes(s.start)}${s.available ? '' : ', taken'}`}
                              onClick={() => setSlotStart(s.start)}
                            >
                              {formatMinutes(s.start)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="panel__actions">
                    <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary"
                      disabled={!date || slotStart === null}
                      onClick={() => setStep(3)}
                    >
                      Continue
                      <ArrowRightIcon className="btn__icon" />
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 3 && service && date && slotStart !== null ? (
                <form className="form" onSubmit={handleSubmit} noValidate>
                  <div>
                    <h3 className="panel__title" ref={titleRef} tabIndex={-1}>
                      Almost done — tell us who is coming.
                    </h3>
                    <p className="panel__hint">
                      {formatLongDate(date)} at {formatMinutes(slotStart)} · {service.name}
                    </p>
                  </div>

                  <div className="form__row">
                    <div className="field">
                      <label className="field__label" htmlFor="bk-name">
                        Full name
                      </label>
                      <input
                        id="bk-name"
                        className="field__input"
                        type="text"
                        name="name"
                        autoComplete="name"
                        maxLength={LIMITS.nameMax}
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        aria-invalid={errors.name ? 'true' : undefined}
                        aria-describedby={errors.name ? 'bk-name-err' : undefined}
                        required
                      />
                      {errors.name ? (
                        <p id="bk-name-err" className="field__error">
                          {errors.name}
                        </p>
                      ) : null}
                    </div>

                    <div className="field">
                      <label className="field__label" htmlFor="bk-phone">
                        Mobile number
                      </label>
                      <input
                        id="bk-phone"
                        className="field__input"
                        type="tel"
                        name="phone"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="0912 345 6789"
                        maxLength={20}
                        value={form.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        aria-invalid={errors.phone ? 'true' : undefined}
                        aria-describedby={errors.phone ? 'bk-phone-err' : undefined}
                        required
                      />
                      {errors.phone ? (
                        <p id="bk-phone-err" className="field__error">
                          {errors.phone}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="bk-email">
                      Email address
                    </label>
                    <input
                      id="bk-email"
                      className="field__input"
                      type="email"
                      name="email"
                      inputMode="email"
                      autoComplete="email"
                      maxLength={LIMITS.emailMax}
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      aria-invalid={errors.email ? 'true' : undefined}
                      aria-describedby={errors.email ? 'bk-email-err' : undefined}
                      required
                    />
                    {errors.email ? (
                      <p id="bk-email-err" className="field__error">
                        {errors.email}
                      </p>
                    ) : null}
                  </div>

                  <div className="field">
                    <label className="field__label" htmlFor="bk-notes">
                      Notes <small>(optional)</small>
                    </label>
                    <textarea
                      id="bk-notes"
                      className="field__input"
                      name="notes"
                      maxLength={LIMITS.notesMax}
                      placeholder="Anything we should know? Allergies, anxiety, a tooth that hurts…"
                      value={form.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      aria-invalid={errors.notes ? 'true' : undefined}
                      aria-describedby={errors.notes ? 'bk-notes-err' : 'bk-notes-count'}
                    />
                    {errors.notes ? (
                      <p id="bk-notes-err" className="field__error">
                        {errors.notes}
                      </p>
                    ) : (
                      <p id="bk-notes-count" className="field__count">
                        {form.notes.length}/{LIMITS.notesMax}
                      </p>
                    )}
                  </div>

                  {/* Honeypot — hidden from people, tempting to bots. */}
                  <div className="hp" aria-hidden="true">
                    <label htmlFor="bk-website">Website</label>
                    <input
                      id="bk-website"
                      type="text"
                      name="website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.website}
                      onChange={(e) => updateField('website', e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label className="consent">
                      <input
                        type="checkbox"
                        name="consent"
                        checked={form.consent}
                        onChange={(e) => updateField('consent', e.target.checked)}
                        aria-invalid={errors.consent ? 'true' : undefined}
                        aria-describedby={errors.consent ? 'bk-consent-err' : undefined}
                      />
                      <span>
                        I confirm these details are correct and agree to be contacted by{' '}
                        {CLINIC.shortName} about this appointment.
                      </span>
                    </label>
                    {errors.consent ? (
                      <p id="bk-consent-err" className="field__error">
                        {errors.consent}
                      </p>
                    ) : null}
                  </div>

                  <div className="panel__actions">
                    <button type="button" className="btn btn--ghost" onClick={() => setStep(2)}>
                      Back
                    </button>
                    <button type="submit" className="btn btn--primary">
                      Confirm booking
                      <CheckIcon className="btn__icon" />
                    </button>
                  </div>
                </form>
              ) : null}

              {step === 'done' && lastBooked ? (
                <div className="success" role="status">
                  <div className="success__icon" aria-hidden="true">
                    <CheckIcon />
                  </div>
                  <h3 className="panel__title" ref={titleRef} tabIndex={-1}>
                    You&rsquo;re booked, {lastBooked.name.split(' ')[0]}!
                  </h3>
                  <p className="panel__hint">
                    We look forward to seeing you. Please arrive 10 minutes early.
                  </p>
                  <div className="success__ref">Ref {lastBooked.reference}</div>

                  <dl className="success__details">
                    <div>
                      <dt>Service</dt>
                      <dd>{findService(lastBooked.serviceId)?.name ?? lastBooked.serviceId}</dd>
                    </div>
                    <div>
                      <dt>Date</dt>
                      <dd>{formatLongDate(parseIsoDate(lastBooked.date) ?? today)}</dd>
                    </div>
                    <div>
                      <dt>Time</dt>
                      <dd>
                        {formatMinutes(lastBooked.start)} –{' '}
                        {formatMinutes(lastBooked.start + lastBooked.durationMinutes)}
                      </dd>
                    </div>
                    <div>
                      <dt>Mobile</dt>
                      <dd>{formatPhoneDisplay(lastBooked.phone)}</dd>
                    </div>
                    <div>
                      <dt>Email</dt>
                      <dd>{lastBooked.email}</dd>
                    </div>
                  </dl>

                  {submitError ? (
                    <div className="alert alert--error" role="alert" style={{ marginTop: 16, textAlign: 'left' }}>
                      <AlertIcon />
                      <span>{submitError}</span>
                    </div>
                  ) : null}

                  <div className="panel__actions" style={{ justifyContent: 'center' }}>
                    <button type="button" className="btn btn--pink" onClick={resetFlow}>
                      Book another appointment
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={120} className="booking__side">
            <aside className="summary" aria-label="Booking summary">
              <h3 className="summary__title">Your booking</h3>
              <ul className="summary__list">
                <li className="summary__item">
                  <ToothIcon />
                  <div>
                    <span className="summary__label">Service</span>
                    {service ? (
                      <span className="summary__value">{service.name}</span>
                    ) : (
                      <span className="summary__value summary__value--empty">Not chosen yet</span>
                    )}
                  </div>
                </li>
                <li className="summary__item">
                  <CalendarIcon />
                  <div>
                    <span className="summary__label">Date</span>
                    {date ? (
                      <span className="summary__value">{formatLongDate(date)}</span>
                    ) : (
                      <span className="summary__value summary__value--empty">Pick a day</span>
                    )}
                  </div>
                </li>
                <li className="summary__item">
                  <ClockIcon />
                  <div>
                    <span className="summary__label">Time</span>
                    {slotStart !== null && service ? (
                      <span className="summary__value">
                        {formatMinutes(slotStart)} – {formatMinutes(slotStart + service.durationMinutes)}
                      </span>
                    ) : (
                      <span className="summary__value summary__value--empty">Pick a slot</span>
                    )}
                  </div>
                </li>
                <li className="summary__item">
                  <UserIcon />
                  <div>
                    <span className="summary__label">Patient</span>
                    {form.name.trim() ? (
                      <span className="summary__value">{form.name.trim()}</span>
                    ) : (
                      <span className="summary__value summary__value--empty">Your name</span>
                    )}
                  </div>
                </li>
              </ul>
              <div className="summary__total">
                <span>{service?.priceFrom ? 'Estimated from' : 'Estimated total'}</span>
                <strong>{service ? formatPeso(service.price) : '—'}</strong>
              </div>
              <p className="summary__note">
                Final cost is confirmed after examination. Payment is settled at the clinic.
              </p>
            </aside>
          </Reveal>
        </div>

        <Reveal>
          <div className="mine">
            <div className="mine__head">
              <h3 className="h3">Your upcoming appointments</h3>
              <span className="pill pill--pink">Saved in this browser</span>
            </div>
            {upcoming.length === 0 ? (
              <div className="slots__empty">No upcoming appointments yet. Your bookings will appear here.</div>
            ) : (
              <ul className="mine__list">
                {upcoming.map((a) => {
                  const d = parseIsoDate(a.date)
                  const svc = findService(a.serviceId)
                  const confirming = confirmCancelId === a.id
                  return (
                    <li key={a.id} className="appt">
                      <div className="appt__date" aria-hidden="true">
                        <b>{d?.day}</b>
                        <span>{d ? MONTH_NAMES[d.month - 1]?.slice(0, 3) : ''}</span>
                      </div>
                      <div className="appt__body">
                        <div className="appt__name">
                          {svc?.name ?? 'Appointment'} · {formatMinutes(a.start)}
                        </div>
                        <div className="appt__meta">
                          {d ? formatLongDate(d) : a.date} · {a.name} · {formatPhoneDisplay(a.phone)}
                        </div>
                        <div className="appt__ref">{a.reference}</div>
                      </div>
                      {confirming ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button type="button" className="appt__cancel" onClick={() => cancelAppointment(a.id)}>
                            Yes, cancel
                          </button>
                          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirmCancelId(null)}>
                            Keep
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="appt__cancel"
                          onClick={() => setConfirmCancelId(a.id)}
                          aria-label={`Cancel appointment ${a.reference}`}
                        >
                          Cancel
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
