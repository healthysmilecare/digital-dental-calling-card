import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  /** Stagger delay in ms. */
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'article' | 'section'
}

/** Fades content in when it scrolls into view. Renders visible when IO is unsupported. */
export function Reveal({ children, delay = 0, className = '', as = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(
    () => typeof window === 'undefined' || !('IntersectionObserver' in window),
  )

  useEffect(() => {
    const node = ref.current
    if (!node || visible) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.disconnect()
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [visible])

  const Tag = as
  const style = { '--reveal-delay': `${delay}ms` } as CSSProperties
  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? 'reveal--visible' : ''} ${className}`.trim()}
      style={style}
    >
      {children}
    </Tag>
  )
}
