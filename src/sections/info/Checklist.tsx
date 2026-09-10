import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Reveal from '@/components/Reveal'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const ROWS = [
  {
    title: 'Tus PDFs nunca se suben',
    detail: 'No existe endpoint de subida. Puedes comprobarlo en la pestaña Red de tu navegador.',
  },
  {
    title: 'Sin cuentas ni registro',
    detail: 'No hay login porque no hay nada que guardar.',
  },
  {
    title: 'Sin cookies de terceros',
    detail: 'No hay analytics, píxeles ni rastreadores publicitarios.',
  },
  {
    title: 'Sin marcas de agua',
    detail: 'Tu documento sale exactamente como tú lo dejaste.',
  },
  {
    title: 'Nada persiste al cerrar',
    detail: 'Los archivos viven en memoria (Blob URLs) y se liberan al cerrar la pestaña.',
  },
  {
    title: 'Código abierto y auditable',
    detail: 'Construido solo con bibliotecas open-source de licencias libres.',
  },
]

/* ✓ mint que se dibuja por trazo */
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
      <path
        className="cl-check"
        d="M4.5 12.5 L10 18 L19.5 6.5"
        stroke="#25C685"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Sección 2 de /privacidad — el checklist "nada se sube".
 * Filas que entran desde la izquierda; cada ✓ se dibuja justo antes de asentarse.
 */
export default function Checklist() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const paths = gsap.utils.toArray<SVGPathElement>('.cl-check')
      paths.forEach((p) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      })
      const tl = gsap.timeline({
        scrollTrigger: { trigger: ref.current, start: 'top 80%', once: true },
      })
      tl.from('.cl-row', {
        x: -24,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.1,
      })
      tl.to(
        paths,
        { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out', stagger: 0.1 },
        0.3,
      )
    },
    { scope: ref },
  )

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-mint">
            El checklist
          </span>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] text-ink">
            Seis promesas que puedes verificar
          </h2>
        </Reveal>

        <Reveal y={24} className="mt-10">
          <div
            ref={ref}
            className="overflow-hidden rounded-3xl border border-line bg-white shadow-card"
          >
            {ROWS.map((row, i) => (
              <div
                key={row.title}
                className={`cl-row flex items-start gap-4 px-6 py-5 transition-colors duration-200 hover:bg-paper-deep md:px-8 ${
                  i > 0 ? 'border-t border-line' : ''
                }`}
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-mint/15">
                  <CheckIcon />
                </span>
                <div>
                  <p className="font-semibold text-ink">{row.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{row.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
