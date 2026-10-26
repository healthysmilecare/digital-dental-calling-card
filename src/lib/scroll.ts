/** Smoothly scroll to a section by id, honouring reduced-motion preferences. */
export function scrollToSection(id: string): void {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
