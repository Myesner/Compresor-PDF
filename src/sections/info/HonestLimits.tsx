import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Reveal from '@/components/Reveal'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const LIMITS = [
  'No editamos el texto dentro de una página (el PDF no es un documento editable como Word).',
  'No abrimos PDFs protegidos con contraseña.',
  'No convertimos a Word/Excel.',
  'Archivos de más de ~200 MB pueden fallar según la memoria de tu dispositivo.',
]

/* ✕ coral que se dibuja por trazos */
function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        className="limit-x"
        d="M6 6 L18 18"
        stroke="#FF5C38"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        className="limit-x"
        d="M18 6 L6 18"
        stroke="#FF5C38"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Sección 5 de /como-funciona — "Lo que PDFácil NO hace (todavía)".
 * Lista honesta con ✕ coral dibujados por scroll.
 */
export default function HonestLimits() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
      })
      tl.from('.limit-row', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.08,
      })
      const paths = gsap.utils.toArray<SVGPathElement>('.limit-x')
      paths.forEach((p) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      })
      tl.to(
        paths,
        { strokeDashoffset: 0, duration: 0.35, ease: 'power2.out', stagger: 0.08 },
        0.15,
      )
    },
    { scope: ref },
  )

  return (
    <section className="pb-16 md:pb-24">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <div
            ref={ref}
            className="rounded-3xl border border-line bg-paper-deep p-8 md:p-12"
          >
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-coral">
              Sin letra pequeña
            </span>
            <h2 className="mt-4 text-[clamp(1.75rem,3.5vw,2.5rem)] text-ink">
              Lo que PDFácil NO hace (todavía)
            </h2>
            <ul className="mt-8 space-y-5">
              {LIMITS.map((limit) => (
                <li key={limit} className="limit-row flex items-start gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral/10">
                    <CrossIcon />
                  </span>
                  <p className="leading-relaxed text-ink">{limit}</p>
                </li>
              ))}
            </ul>
            <p className="mt-8 border-t border-line pt-6 text-sm italic text-ink-soft">
              Preferimos decírtelo claro a prometer de más.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
