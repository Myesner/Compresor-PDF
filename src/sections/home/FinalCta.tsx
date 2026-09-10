import { useRef } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/** Patrón decorativo de hojas punteadas con drift lento. */
function DottedSheets() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="animate-drift-slow absolute -left-10 top-0 h-full w-[calc(100%+80px)] text-white"
        style={{ opacity: 0.08 }}
        fill="none"
      >
        <defs>
          <pattern id="sheet-dots" width="140" height="180" patternUnits="userSpaceOnUse">
            <rect x="30" y="30" width="64" height="84" rx="8" stroke="currentColor" strokeWidth="3" strokeDasharray="6 8" />
            <path d="M78 30 l16 16 h-16 z" stroke="currentColor" strokeWidth="3" strokeDasharray="4 5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sheet-dots)" />
      </svg>
    </div>
  )
}

/** Sección 8 — CTA final. */
export default function FinalCta() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '.cta-card',
        { clipPath: 'inset(0 0 100% 0 round 24px)' },
        {
          clipPath: 'inset(0 0 0% 0 round 24px)',
          duration: 0.9,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: ref.current, start: 'top 78%', once: true },
        },
      )
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="bg-paper pb-20 pt-4 md:pb-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="cta-card relative overflow-hidden rounded-3xl bg-ink px-6 py-20 text-center md:py-24">
          <DottedSheets />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl text-[clamp(2rem,4vw,3rem)] text-white">
              Tu próximo PDF pesa menos.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-white/60">
              Gratis para siempre, sin registro y sin que tus documentos salgan de tu dispositivo.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/comprimir"
                  className="inline-flex items-center rounded-xl bg-violet px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-violet-deep"
                >
                  Comprimir PDF
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/editor"
                  className="inline-flex items-center rounded-xl border-2 border-white/70 px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white hover:text-ink"
                >
                  Editar páginas
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
