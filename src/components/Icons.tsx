import type { SVGProps } from 'react'
import type { ServiceIcon } from '../data/clinic'

type IconProps = SVGProps<SVGSVGElement>

const base: IconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
}

export function ToothIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 4.5c-2.2 0-2.6-1.2-4.9-.8C4.4 4.2 3.3 7 3.7 9.6c.4 3 2.1 4.5 2.9 8 .4 2.1 1.1 3.9 2.6 3.9 1.8 0 1.8-3 2.8-4.5 1 1.5 1 4.5 2.8 4.5 1.5 0 2.2-1.8 2.6-3.9.8-3.5 2.5-5 2.9-8 .4-2.6-.7-5.4-3.4-5.9-2.3-.4-2.7.8-4.9.8z" />
    </svg>
  )
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
    </svg>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v5c0 5-3.2 8.4-7 10-3.8-1.6-7-5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

export function DrillIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20l6-6" />
      <path d="M8.5 9.5L14.5 15.5" />
      <path d="M11 7l6 6 3.5-3.5a2 2 0 000-2.8L17.3 3.5a2 2 0 00-2.8 0z" />
    </svg>
  )
}

export function CrownIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z" />
      <path d="M5 19h14" />
    </svg>
  )
}

export function BracesIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 12c3-5 6-5 9-5s6 0 9 5" />
      <path d="M3 12h18" />
      <rect x="5" y="10" width="3" height="4" rx="1" />
      <rect x="10.5" y="10" width="3" height="4" rx="1" />
      <rect x="16" y="10" width="3" height="4" rx="1" />
    </svg>
  )
}

export function XrayIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M12 7v10" />
      <path d="M9 10h6" />
      <path d="M8.5 14h7" />
    </svg>
  )
}

export function RootIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 4h8c1.5 0 2 1.2 2 2.5 0 2-1.5 3-1.5 5.5 0 3-1 8-2.5 8-1 0-1.5-3-2-5-.5 2-1 5-2 5-1.5 0-2.5-5-2.5-8C7.5 9.5 6 8.5 6 6.5 6 5.2 6.5 4 8 4z" />
      <path d="M12 7v5" />
    </svg>
  )
}

export function ExtractIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 3h6" />
      <path d="M12 3v7" />
      <path d="M8 10h8l-1 4.5c-.4 1.9-1 6.5-2.3 6.5-.9 0-1.2-2.5-1.7-4-.5 1.5-.8 4-1.7 4C8 21 7.4 16.4 7 14.5z" />
    </svg>
  )
}

export function ImplantIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3h10v4H7z" />
      <path d="M9 7v3h6V7" />
      <path d="M10 10l1 11h2l1-11" />
      <path d="M10.3 13h3.4M10.6 16h2.8" />
    </svg>
  )
}

export function DentureIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3 11c0-4 4-6 9-6s9 2 9 6-4 7-9 7-9-3-9-7z" />
      <path d="M3 11h18" />
      <path d="M7 8v3M10 7v4M14 7v4M17 8v3" />
      <path d="M7 14v3M10 15v3M14 15v3M17 14v3" />
    </svg>
  )
}

export function ChildIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M9 7.5a4 4 0 016 0" />
      <path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6" />
      <path d="M10 10c.5.6 1.2.9 2 .9s1.5-.3 2-.9" />
    </svg>
  )
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  )
}

export function PinIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  )
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
    </svg>
  )
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M3 8l9 6 9-6" />
    </svg>
  )
}

export function UserIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={2.4} {...props}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M9 5l7 7-7 7" />
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 12h16M13 5l7 7-7 7" />
    </svg>
  )
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20V4M5 11l7-7 7 7" />
    </svg>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l9.5 17h-19z" />
      <path d="M12 10v4M12 17h.01" />
    </svg>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function HeartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20s-7-4.5-7-10a4 4 0 017-2.5A4 4 0 0119 10c0 5.5-7 10-7 10z" />
    </svg>
  )
}

export function LeafIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 19C5 9 11 4 20 4c0 9-5 15-15 15z" />
      <path d="M5 19c3-5 6-8 10-10" />
    </svg>
  )
}

export function StarIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 16.9l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8z" />
    </svg>
  )
}

const SERVICE_ICON_MAP: Record<ServiceIcon, (props: IconProps) => React.JSX.Element> = {
  tooth: ToothIcon,
  sparkle: SparkleIcon,
  shield: ShieldIcon,
  drill: DrillIcon,
  crown: CrownIcon,
  braces: BracesIcon,
  xray: XrayIcon,
  root: RootIcon,
  extract: ExtractIcon,
  implant: ImplantIcon,
  denture: DentureIcon,
  child: ChildIcon,
}

export function ServiceGlyph({ icon, ...props }: IconProps & { icon: ServiceIcon }) {
  const Component = SERVICE_ICON_MAP[icon]
  return <Component {...props} />
}
