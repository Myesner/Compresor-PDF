import { useRef, memo } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

gsap.registerPlugin(useGSAP)

export interface HeroWord {
  text: string
  className?: string
}

interface InfoHeroProps {
  eyebrow: string
  eyebrowClassName?: string
  words: HeroWord[]
  lead: ReactNode
  imageSrc: string
  imageAlt?: string
  imageWidthClassName?: string
  /** Palabra exacta que recibe el subrayado dibujado (stroke). */
  underlineWord?: string
  underlineColor?: string
}

/* Ilustración con flotación yoyo (bucle aislado en micro-componente memoizado) */
const FloatingImage = memo(function FloatingImage({
  src,
  alt,
  className,
}: {
  src: string
  alt: string
  className?: string
}) {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
})

/**
 * Hero editorial compartido por /como-funciona y /privacidad:
 * etiqueta small, H1 con split por palabra (GSAP), lead e ilustración flotante.
 */
export default function InfoHero({
  eyebrow,
  eyebrowClassName = 'text-violet',
  words,
  lead,
  imageSrc,
  imageAlt = '',
  imageWidthClassName = 'max-w-[480px]',
  underlineWord,
  underlineColor = '#25C685',
}: InfoHeroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const underlineRef = useRef<SVGPathElement>(null)
  const imgWrapRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.from('.info-hero-word', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.05,
        ease: 'power3.out',
      })
      gsap.from('.info-hero-lead', {
        y: 20,
        opacity: 0,
        duration: 0.7,
        delay: 0.35,
        ease: 'power3.out',
      })
      if (imgWrapRef.current) {
        gsap.from(imgWrapRef.current, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          delay: 0.3,
          ease: 'power3.out',
        })
      }
      const path = underlineRef.current
      if (path) {
        const len = path.getTotalLength()
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 0.9, delay: 0.7, ease: 'power2.inOut' },
        )
      }
    },
    { scope: ref },
  )

  return (
    <section className="hero-radial relative overflow-hidden">
      <div className="noise-overlay absolute inset-0" aria-hidden="true" />
      <div
        ref={ref}
        className="relative mx-auto flex max-w-3xl flex-col items-center px-6 pb-16 pt-16 text-center md:pb-20 md:pt-24"
      >
        <span
          className={cn(
            'font-mono text-xs font-semibold uppercase tracking-[0.2em]',
            eyebrowClassName,
          )}
        >
          {eyebrow}
        </span>
        <h1 className="mt-5 text-[clamp(2.25rem,6vw,4rem)] leading-[1.08] text-ink">
          {words.map((w, i) => {
            const isUnderline = underlineWord !== undefined && w.text === underlineWord
            const inner = (
              <span className={cn('info-hero-word inline-block', w.className)}>{w.text}</span>
            )
            return (
              <span key={`${w.text}-${i}`}>
                {isUnderline ? (
                  <span className="relative inline-block">
                    <span className="inline-block overflow-hidden pb-1 align-bottom">{inner}</span>
                    <svg
                      className="absolute -bottom-1 left-0 h-3 w-full"
                      viewBox="0 0 300 14"
                      fill="none"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        ref={underlineRef}
                        d="M4 10 C 60 3, 120 12, 170 7 S 270 4, 296 8"
                        stroke={underlineColor}
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                ) : (
                  <span className="inline-block overflow-hidden pb-1 align-bottom">{inner}</span>
                )}{' '}
              </span>
            )
          })}
        </h1>
        <p className="info-hero-lead mt-6 max-w-2xl text-xl leading-relaxed text-ink-soft">
          {lead}
        </p>
        <div ref={imgWrapRef} className="mt-10">
          <FloatingImage
            src={imageSrc}
            alt={imageAlt}
            className={cn('w-full', imageWidthClassName)}
          />
        </div>
      </div>
    </section>
  )
}
