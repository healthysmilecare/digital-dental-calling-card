import { useMemo } from 'react'
import { CLINIC, WEEKLY_HOURS } from '../data/clinic'
import { useNow } from '../hooks/useNow'
import {
  formatHoursRange,
  formatMinutes,
  getOpenStatus,
  getZonedParts,
  minutesOfDay,
  MONTH_NAMES,
  WEEKDAY_NAMES,
  type Weekday,
} from '../lib/time'
import { scrollToSection } from '../lib/scroll'
import { ArrowRightIcon, PhoneIcon } from './Icons'
import { Reveal } from './Reveal'

const DAY_ORDER: Weekday[] = [1, 2, 3, 4, 5, 6, 0]

/** DEMO: presentation-only trust figures. */
const STATS = [
  { value: '10+', label: 'Years of gentle care' },
  { value: '4.9★', label: 'Average patient rating' },
  { value: '6,000+', label: 'Smiles cared for' },
] as const

export function Hero() {
  const now = useNow(15_000)
  const parts = useMemo(() => getZonedParts(now, CLINIC.timeZone), [now])
  const status = useMemo(() => getOpenStatus(parts, WEEKLY_HOURS), [parts])
  const clock = formatMinutes(minutesOfDay(parts))
  const dateLabel = `${WEEKDAY_NAMES[parts.weekday]}, ${MONTH_NAMES[parts.month - 1]} ${parts.day}`

  return (
    <section id="home" className="hero" aria-labelledby="home-title">
      <div className="hero__bg" aria-hidden="true">
        <div className="blob blob--pink" />
        <div className="blob blob--brown" />
      </div>

      <div className="container hero__grid">
        <div>
          <Reveal>
            <div className={`status status--${status.state}`} role="status" aria-live="polite">
              <span className="status__dot" aria-hidden="true" />
              <span>{status.headline}</span>
              <span className="status__detail">· {status.detail}</span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1 id="home-title" className="h1 hero__title">
              Gentle care for your <span className="italic-accent">healthiest</span> smile.
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="lede">
              Welcome to {CLINIC.name}. Dr. {CLINIC.doctor.fullName}, {CLINIC.doctor.title}, and
              her team make every visit calm, clear and comfortable, from routine cleanings to
              complete smile makeovers.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="hero__actions">
              <button type="button" className="btn btn--primary" onClick={() => scrollToSection('appointment')}>
                Book an appointment
                <ArrowRightIcon className="btn__icon" />
              </button>
              <a className="btn btn--ghost" href={CLINIC.contact.phoneHref}>
                <PhoneIcon className="btn__icon" />
                {CLINIC.contact.phoneDisplay}
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <dl className="hero__trust">
              {STATS.map((s) => (
                <div key={s.label} className="stat">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="stat__value" style={{ margin: 0 }}>
                    {s.value}
                  </dd>
                  <dd className="stat__label" style={{ margin: 0 }}>
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={200}>
          <article className="avail" aria-labelledby="avail-title">
            <div className="avail__top">
              <div>
                <h2 id="avail-title" className="avail__title">
                  Clinic hours
                </h2>
                <p className="avail__tz">Local time · {CLINIC.address}</p>
              </div>
              <div className="avail__clock" aria-live="off">
                <div className="avail__time">{clock}</div>
                <div className="avail__date">{dateLabel}</div>
              </div>
            </div>

            <ul className="hours">
              {DAY_ORDER.map((day) => {
                const hours = WEEKLY_HOURS[day]
                const isToday = day === parts.weekday
                return (
                  <li key={day} className={`hours__row ${isToday ? 'hours__row--today' : ''}`}>
                    <span className="hours__day">
                      {WEEKDAY_NAMES[day]}
                      {isToday ? <span className="hours__badge">Today</span> : null}
                    </span>
                    <span className={`hours__time ${hours ? '' : 'hours__time--closed'}`}>
                      {formatHoursRange(hours)}
                    </span>
                  </li>
                )
              })}
            </ul>

            <div className="avail__foot">
              <span>Lunch break 12:00 – 1:00 PM on weekdays</span>
              <button type="button" className="btn btn--pink btn--sm" onClick={() => scrollToSection('appointment')}>
                See open slots
              </button>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  )
}

const MARQUEE_ITEMS = [
  'Painless cleanings',
  'Same-week appointments',
  'Kid-friendly visits',
  'Digital X-rays',
  'Teeth whitening',
  'Clear aligners',
  'Transparent peso pricing',
]

export function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS]
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {items.map((item, i) => (
          <span key={`${item}-${i}`} className="marquee__item">
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
