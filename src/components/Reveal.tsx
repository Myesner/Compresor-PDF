import { useRef } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface RevealProps {
  children: ReactNode
  className?: string
  /** Desplazamiento vertical inicial (px). */
  y?: number
  delay?: number
  duration?: number
  /** Si true, anima los hijos directos con stagger en lugar del contenedor. */
  staggerChildren?: boolean
  stagger?: number
}

/**
 * Reveal estándar por scroll (GSAP + ScrollTrigger, una sola vez):
 * sube `y` px con fade, ease power3.out, trigger al 80% del viewport.
 */
export default function Reveal({
  children,
  className,
  y = 40,
  delay = 0,
  duration = 0.7,
  staggerChildren = false,
  stagger = 0.1,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const targets = staggerChildren ? Array.from(el.children) : el
      gsap.from(targets, {
        y,
        opacity: 0,
        duration,
        delay,
        ease: 'power3.out',
        stagger: staggerChildren ? stagger : 0,
        scrollTrigger: { trigger: el, start: 'top 80%', once: true },
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
