import { useEffect, useState } from 'react'
import { Brand } from './Logo'
import { CloseIcon, MenuIcon } from './Icons'
import { scrollToSection } from '../lib/scroll'

export const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'appointment', label: 'Appointment' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<SectionId>('home')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the section occupying the middle of the viewport.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (hit) setActive(hit.target.id as SectionId)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.01, 0.2] },
    )
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  // Close the mobile drawer on Escape and on resize to desktop.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onResize = () => {
      if (window.innerWidth >= 900) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const go = (id: SectionId) => {
    setOpen(false)
    scrollToSection(id)
    if (window.history.replaceState) {
      window.history.replaceState(null, '', `#${id}`)
    }
  }

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="container nav__inner">
        <Brand onClick={() => go('home')} />

        <nav aria-label="Primary">
          <ul className="nav__links">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="nav__link"
                  aria-current={active === s.id ? 'true' : undefined}
                  onClick={(e) => {
                    e.preventDefault()
                    go(s.id)
                  }}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav__actions">
          <button type="button" className="btn btn--pink btn--sm nav__cta" onClick={() => go('appointment')}>
            Book now
          </button>
          <button
            type="button"
            className="nav__burger"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <nav id="mobile-menu" className="nav__drawer" aria-label="Mobile">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="nav__link"
              aria-current={active === s.id ? 'true' : undefined}
              onClick={(e) => {
                e.preventDefault()
                go(s.id)
              }}
            >
              {s.label}
            </a>
          ))}
          <button type="button" className="btn btn--pink btn--block" onClick={() => go('appointment')}>
            Book an appointment
          </button>
        </nav>
      ) : null}
    </header>
  )
}
