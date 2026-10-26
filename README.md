# Healthy Smile Care Dental Clinic — digital calling card

A single-page, scrollable web app for **Healthy Smile Care Dental Clinic**
(Dr. Stiffany Faith Sitoy, DMD). It presents the clinic's availability, story,
services with peso pricing, and an interactive appointment booker.

> **Demo status.** Most content (prices, founding date, ratings, patient
> counts, "already booked" slots) is placeholder data for presentation.
> Bookings are stored only in the visitor's browser; nothing is sent anywhere
> yet. See [Next steps](#next-steps).

## Sections

| Section | What it does |
| --- | --- |
| **Home** | Live "Open now / Closed" status computed in the clinic's time zone, weekly hours with today highlighted, quick trust stats and calls to action. |
| **About** | Established date, location, doctor profile, contact details, clinic values. |
| **Services** | Filterable grid of treatments with prices in Philippine pesos (₱) and typical duration. "Book" jumps straight into the booking flow with that service pre-selected. |
| **Appointment** | Three-step booker: service → calendar + time slots (closed days, past dates, lunch break and taken slots are blocked) → patient details with validation. Shows a reference code and lists upcoming bookings with cancel. |

Brand: baby pink (`#f8c8d4`) and wooden brown (`#5a3a26`) on warm cream.
Fonts: Fraunces (display) and Plus Jakarta Sans (body), self-hosted.

## Stack

- [Vite](https://vite.dev) 8 + [React](https://react.dev) 19 + TypeScript (strict)
- Hand-written CSS with design tokens in `src/styles/global.css` (no CSS framework)
- No runtime dependencies beyond React and the two self-hosted font packages

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build locally
```

## Project layout

```
index.html                 Document shell, meta tags
vite.config.ts             Build config + production Content-Security-Policy
public/favicon.svg         Brand mark
src/
  main.tsx                 Entry point (fonts, global CSS, React root)
  App.tsx                  Page composition
  data/clinic.ts           ← Clinic info, hours, services & prices (edit here)
  lib/time.ts              Time-zone aware status, calendar and slot maths
  lib/validation.ts        Form validation / normalisation rules
  lib/storage.ts           Safe localStorage persistence of bookings
  lib/scroll.ts            Smooth-scroll helper (honours reduced motion)
  hooks/                   useNow, useReducedMotion
  components/              Navbar, Hero, About, Services, Appointment, Footer, Logo, Icons, Reveal
  styles/global.css        Design tokens and all component styles
```

To change clinic details, hours, services or prices, edit `src/data/clinic.ts`
only. Everything else reads from it.

## Security notes

- **Content Security Policy** is injected into the production `index.html`
  (`vite.config.ts`): scripts, styles, fonts and connections are restricted to
  the site's own origin; no inline scripts, no `eval`, no third-party requests.
  Asset inlining is disabled so the policy holds for every font file.
- `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy` and
  `Strict-Transport-Security` cannot be set from HTML. Configure them as HTTP
  headers on the host (Netlify/Vercel/nginx) when deploying.
- No `dangerouslySetInnerHTML`; all user text is rendered through React's
  escaping.
- Form inputs are length-limited, normalised and validated on submit
  (name charset, Philippine mobile format, email shape, notes length), with a
  hidden honeypot field to discourage bots.
- Everything read back from `localStorage` is treated as untrusted and
  validated field-by-field before use; malformed data is dropped silently.
- Booking reference codes and ids use `crypto.getRandomValues` /
  `crypto.randomUUID`.
- The dev server is restricted to the project directory (`server.fs.strict`).
- No secrets, API keys or analytics are present in the repository.

## Known limitations (by design, for this phase)

- Bookings never leave the browser, so the clinic cannot see them yet.
- "Taken" slots are generated deterministically from the date for realism.
- Trust figures, founding date, bio and prices are placeholders.

## Next steps

1. Add a backend (or a hosted form/booking service) and move the persistence
   layer in `src/lib/storage.ts` behind an API with server-side validation,
   rate limiting and email/SMS confirmation.
2. Replace placeholder content in `src/data/clinic.ts`.
3. Set the HTTP security headers listed above on the hosting platform.
4. Optional: admin view for the clinic to manage the schedule.
