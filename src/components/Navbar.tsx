import { useCallback, useEffect, useRef, useState } from 'react'
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

  /**
   * Active-section tracking.
   *
   * Deterministic rule: the active section is the last one whose top edge is
   * above a marker placed 35% down the viewport (or the final section once
   * the page is scrolled to the bottom). After a nav click the highlight is
   * locked to the target until scrolling settles, so it does not flicker
   * through the sections the smooth scroll passes over.
   */
  const lockRef = useRef<SectionId | null>(null)
  const unlockTimer = useRef<number | null>(null)

  const computeActive = useCallback(() => {
    if (lockRef.current) return
    const marker = window.scrollY + window.innerHeight * 0.35
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    let current: SectionId = SECTIONS[0].id
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id)
      if (!el) continue
      const top = el.getBoundingClientRect().top + window.scrollY
      if (top <= marker) current = s.id
    }
    if (atBottom) current = SECTIONS[SECTIONS.length - 1]!.id
    setActive(current)
  }, [])

  const releaseLock = useCallback(() => {
    if (unlockTimer.current !== null) window.clearTimeout(unlockTimer.current)
    unlockTimer.current = window.setTimeout(() => {
      lockRef.current = null
      unlockTimer.current = null
      computeActive()
    }, 160)
  }, [computeActive])

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (lockRef.current) releaseLock()
      if (!raf) {
        raf = window.requestAnimationFrame(() => {
          raf = 0
          computeActive()
        })
      }
    }
    computeActive()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
      if (unlockTimer.current !== null) window.clearTimeout(unlockTimer.current)
    }
  }, [computeActive, releaseLock])

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
    setActive(id)
    lockRef.current = id
    // Release even if no scroll event follows (already at the target).
    releaseLock()
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
