import { CLINIC } from '../data/clinic'

interface LogoMarkProps {
  className?: string
  /** Decorative by default; pass a title to expose it to assistive tech. */
  title?: string
}

/**
 * Brand mark: a soft tooth silhouette wearing a smile, with a sparkle of
 * "care". Baby-pink gradient on a wooden-brown smile stroke.
 */
export function LogoMark({ className, title }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable={false}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <linearGradient id="hsc-tooth" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff2f5" />
          <stop offset="1" stopColor="#f3abbd" />
        </linearGradient>
        <linearGradient id="hsc-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7a4f30" />
          <stop offset="1" stopColor="#5a3a26" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#hsc-ring)" />
      <path
        d="M32 15c-5 0-5.8-2.4-10.6-1.6-5.6 1-7.9 6.4-7.1 11.6.8 6 4.2 9 5.8 16 .8 4.2 2.2 7.6 5.2 7.6 3.6 0 3.6-6 5.6-9 2 3 2 9 5.6 9 3 0 4.4-3.4 5.2-7.6 1.6-7 5-10 5.8-16 .8-5.2-1.5-10.6-7.1-11.6C37.8 12.6 37 15 32 15z"
        fill="url(#hsc-tooth)"
      />
      <path
        d="M24.5 29.5q7.5 8.5 15 0"
        fill="none"
        stroke="#5a3a26"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M46 10l1.3 3.2 3.2 1.3-3.2 1.3L46 19l-1.3-3.2-3.2-1.3 3.2-1.3z"
        fill="#fde7ec"
      />
    </svg>
  )
}

interface BrandProps {
  onClick?: () => void
  href?: string
}

export function Brand({ onClick, href = '#home' }: BrandProps) {
  return (
    <a
      href={href}
      className="brand"
      aria-label={`${CLINIC.name} — back to top`}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault()
          onClick()
        }
      }}
    >
      <LogoMark className="brand__mark" />
      <span className="brand__text">
        <span className="brand__name">{CLINIC.shortName}</span>
        <span className="brand__sub">Dental Clinic</span>
      </span>
    </a>
  )
}
