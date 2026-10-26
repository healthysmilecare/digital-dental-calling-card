import { useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { Hero, Marquee } from './components/Hero'
import { About } from './components/About'
import { Services } from './components/Services'
import { Appointment, type BookingRequest } from './components/Appointment'
import { Footer } from './components/Footer'
import { ArrowUpIcon } from './components/Icons'
import { scrollToSection } from './lib/scroll'
import type { Service } from './data/clinic'

function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <button
      type="button"
      className={`totop ${show ? 'totop--show' : ''}`}
      onClick={() => scrollToSection('home')}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
    >
      <ArrowUpIcon />
    </button>
  )
}

export default function App() {
  const [request, setRequest] = useState<BookingRequest | null>(null)

  const handleBook = (service: Service) => {
    setRequest((prev) => ({ serviceId: service.id, nonce: (prev?.nonce ?? 0) + 1 }))
    scrollToSection('appointment')
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <About />
        <Services onBook={handleBook} />
        <Appointment request={request} />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
