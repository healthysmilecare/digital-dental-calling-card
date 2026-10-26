import { useState } from 'react'
import {
  formatPeso,
  SERVICE_CATEGORIES,
  SERVICES,
  type Service,
  type ServiceCategory,
} from '../data/clinic'
import { ArrowRightIcon, ServiceGlyph } from './Icons'
import { Reveal } from './Reveal'

type Filter = 'All' | ServiceCategory

interface ServicesProps {
  onBook: (service: Service) => void
}

export function Services({ onBook }: ServicesProps) {
  const [filter, setFilter] = useState<Filter>('All')
  const visible = filter === 'All' ? SERVICES : SERVICES.filter((s) => s.category === filter)

  return (
    <section id="services" className="section" aria-labelledby="services-title">
      <div className="container">
        <Reveal>
          <div className="section__head section__head--center">
            <span className="eyebrow">Services &amp; pricing</span>
            <h2 id="services-title" className="h2">
              Everything your smile needs, <span className="italic-accent">priced clearly</span>.
            </h2>
            <p className="lede">
              Transparent peso pricing for every treatment. Final quotes are confirmed after your
              consultation.
            </p>
          </div>
        </Reveal>

        <Reveal delay={80}>
          <div className="filters" role="group" aria-label="Filter services by category">
            {(['All', ...SERVICE_CATEGORIES] as Filter[]).map((cat) => (
              <button
                key={cat}
                type="button"
                className="chip"
                aria-pressed={filter === cat}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="services__grid" aria-live="polite">
          {visible.map((service, i) => (
            <article
              // Keying on filter re-runs the entrance animation after filtering.
              key={`${filter}-${service.id}`}
              className="service"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
              <div className="service__top">
                <span className="service__icon">
                  <ServiceGlyph icon={service.icon} />
                </span>
                {service.popular ? <span className="service__badge">Popular</span> : null}
              </div>
              <div className="service__cat">{service.category}</div>
              <h3 className="service__name">{service.name}</h3>
              <p className="service__desc">{service.description}</p>
              <div className="service__foot">
                <div>
                  {service.priceFrom ? <span className="price__from">from</span> : null}
                  <span className="price__value">{formatPeso(service.price)}</span>
                  <span className="price__dur">≈ {service.durationMinutes} min</span>
                </div>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => onBook(service)}
                  aria-label={`Book ${service.name}`}
                >
                  Book
                  <ArrowRightIcon className="btn__icon" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="services__note">
          Prices shown are indicative and in Philippine pesos (₱). Senior citizen and PWD discounts
          apply as provided by law.
        </p>
      </div>
    </section>
  )
}
