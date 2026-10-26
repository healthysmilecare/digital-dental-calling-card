import { CLINIC } from '../data/clinic'
import { CalendarIcon, CheckIcon, HeartIcon, LeafIcon, MailIcon, PhoneIcon, PinIcon, StarIcon } from './Icons'
import { Reveal } from './Reveal'

const VALUES = [
  {
    title: 'Comfort first',
    text: 'Numbing gels, gentle techniques and a calm pace, so anxious patients feel at ease.',
  },
  {
    title: 'Honest pricing',
    text: 'Every treatment is quoted up front in pesos, with no surprise add-ons.',
  },
  {
    title: 'Modern tools',
    text: 'Digital X-rays and sterilised instruments for safe, precise care.',
  },
  {
    title: 'Family friendly',
    text: 'From a toddler’s first check-up to grandparents’ dentures, everyone is welcome.',
  },
] as const

function getInitials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function About() {
  const yearsOpen = new Date().getFullYear() - CLINIC.establishedYear

  return (
    <section id="about" className="section section--tint" aria-labelledby="about-title">
      <div className="container">
        <div className="about__grid">
          <Reveal>
            <article className="doctor" aria-label={`About Dr. ${CLINIC.doctor.fullName}`}>
              <div className="doctor__portrait" aria-hidden="true">
                <span className="doctor__initials">{getInitials(CLINIC.doctor.fullName)}</span>
              </div>
              <h3 className="doctor__name">
                Dr. {CLINIC.doctor.fullName}
                <small>{CLINIC.doctor.title}</small>
              </h3>
              <p className="doctor__role">{CLINIC.doctor.role}</p>
              <p className="doctor__bio">{CLINIC.doctor.bio}</p>

              <div className="doctor__contact">
                <a className="contact-row" href={CLINIC.contact.phoneHref}>
                  <span className="contact-row__icon">
                    <PhoneIcon />
                  </span>
                  <span>
                    <span className="contact-row__label">Call or text</span>
                    {CLINIC.contact.phoneDisplay}
                  </span>
                </a>
                <a className="contact-row" href={`mailto:${CLINIC.contact.email}`}>
                  <span className="contact-row__icon">
                    <MailIcon />
                  </span>
                  <span>
                    <span className="contact-row__label">Email</span>
                    {CLINIC.contact.email}
                  </span>
                </a>
                <div className="contact-row">
                  <span className="contact-row__icon">
                    <PinIcon />
                  </span>
                  <span>
                    <span className="contact-row__label">Clinic address</span>
                    {CLINIC.address}
                  </span>
                </div>
              </div>
            </article>
          </Reveal>

          <div>
            <Reveal>
              <div className="section__head" style={{ marginBottom: 0 }}>
                <span className="eyebrow">About the clinic</span>
                <h2 id="about-title" className="h2">
                  A neighbourhood clinic built on <span className="italic-accent">trust</span>.
                </h2>
                <p className="lede">
                  Established in {CLINIC.establishedMonth} {CLINIC.establishedYear}, {CLINIC.name}{' '}
                  has grown from a single chair into a warm, modern practice at the heart of{' '}
                  {CLINIC.address}. Our mission is simple: healthy smiles, zero dread.
                </p>
              </div>
            </Reveal>

            <div className="facts">
              <Reveal delay={60}>
                <div className="fact">
                  <span className="fact__icon">
                    <CalendarIcon />
                  </span>
                  <div className="fact__label">Established</div>
                  <div className="fact__value">
                    {CLINIC.establishedMonth} {CLINIC.establishedYear}
                  </div>
                  <p className="fact__note">{yearsOpen} years of caring for the community</p>
                </div>
              </Reveal>
              <Reveal delay={120}>
                <div className="fact">
                  <span className="fact__icon">
                    <PinIcon />
                  </span>
                  <div className="fact__label">Location</div>
                  <div className="fact__value">{CLINIC.address}</div>
                  <p className="fact__note">Easy to reach, with parking nearby</p>
                </div>
              </Reveal>
              <Reveal delay={180}>
                <div className="fact">
                  <span className="fact__icon">
                    <HeartIcon />
                  </span>
                  <div className="fact__label">Our promise</div>
                  <div className="fact__value">Gentle &amp; honest</div>
                  <p className="fact__note">Treatment plans explained in plain language</p>
                </div>
              </Reveal>
              <Reveal delay={240}>
                <div className="fact">
                  <span className="fact__icon">
                    <StarIcon />
                  </span>
                  <div className="fact__label">Patient rating</div>
                  <div className="fact__value">4.9 / 5</div>
                  <p className="fact__note">Based on patient feedback (demo figure)</p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={120}>
              <ul className="values" aria-label="What we stand for">
                {VALUES.map((v) => (
                  <li key={v.title}>
                    <span className="values__check" aria-hidden="true">
                      <CheckIcon />
                    </span>
                    <div>
                      <strong>{v.title}</strong>
                      <span>{v.text}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={160}>
              <p className="pill pill--pink" style={{ marginTop: 28 }}>
                <LeafIcon className="btn__icon" aria-hidden="true" />
                Eco-conscious: digital records, no paper charts
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
