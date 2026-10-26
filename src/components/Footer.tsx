import { CLINIC, WEEKLY_HOURS } from '../data/clinic'
import { formatHoursRange } from '../lib/time'
import { Brand } from './Logo'
import { SECTIONS } from './Navbar'
import { scrollToSection } from '../lib/scroll'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <Brand onClick={() => scrollToSection('home')} />
            <p className="footer__blurb">
              {CLINIC.tagline} Led by Dr. {CLINIC.doctor.fullName}, {CLINIC.doctor.title}.
            </p>
          </div>

          <div>
            <h3 className="footer__title">Visit</h3>
            <ul className="footer__list">
              <li>{CLINIC.address}</li>
              <li>
                <a href={CLINIC.contact.phoneHref}>{CLINIC.contact.phoneDisplay}</a>
              </li>
              <li>
                <a href={`mailto:${CLINIC.contact.email}`}>{CLINIC.contact.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="footer__title">Hours</h3>
            <ul className="footer__list">
              <li>Mon – Fri · {formatHoursRange(WEEKLY_HOURS[1])}</li>
              <li>Saturday · {formatHoursRange(WEEKLY_HOURS[6])}</li>
              <li>Sunday · {formatHoursRange(WEEKLY_HOURS[0])}</li>
            </ul>
            <h3 className="footer__title" style={{ marginTop: 24 }}>
              Explore
            </h3>
            <ul className="footer__list">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection(s.id)
                    }}
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            © {year} {CLINIC.name}. All rights reserved.
          </span>
          <span>Demo site · information shown is for presentation purposes.</span>
        </div>
      </div>
    </footer>
  )
}
