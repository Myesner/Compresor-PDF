import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { FileUp, Monitor, Cog, ArrowDownToLine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Reveal from '@/components/Reveal'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Station {
  icon: LucideIcon
  /** Micro-loop CSS propio de cada icono. */
  iconAnimation: string
  title: string
  copy: string
}

const STATIONS: Station[] = [
  {
    icon: FileUp,
    iconAnimation: 'animate-bounce [animation-duration:2.4s]',
    title: 'Tu archivo',
    copy: 'Suelta el PDF. Se lee con la API File del navegador: nunca viaja por la red.',
  },
  {
    icon: Monitor,
    iconAnimation: 'animate-pulse [animation-duration:1.8s]',
    title: 'PDF.js dibuja',
    copy: 'Renderizamos cada página en un <canvas> para que veas las miniaturas al instante.',
  },
  {
    icon: Cog,
    iconAnimation: 'animate-spin [animation-duration:8s]',
    title: 'pdf-lib reconstruye',
    copy: 'Creamos un documento nuevo con solo las páginas que elegiste, en el orden que elegiste, con las rotaciones aplicadas.',
  },
  {
    icon: ArrowDownToLine,
    iconAnimation: 'animate-bounce [animation-duration:1.6s]',
    title: 'Descarga local',
    copy: 'Generamos un Blob y lo descargas. Cerrar la pestaña borra todo: no hay caché, no hay historial.',
  },
]

/**
 * Sección 2 de /como-funciona — "El viaje de tu PDF".
 * Línea conectora (horizontal en desktop, vertical en móvil) que se dibuja
 * con el scroll (scrub) y estaciones que aparecen cuando la línea las alcanza.
 */
export default function Pipeline() {
  const wrapRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const buildTimeline = (path: SVGPathElement | null, trigger: HTMLElement) => {
        if (!path) return null
        const len = path.getTotalLength()
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger,
            start: 'top 78%',
            end: 'bottom 55%',
            scrub: 0.5,
          },
        })
        tl.to(path, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0)
        tl.fromTo(
          '.pipe-station',
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.18, ease: 'power2.out', stagger: 0.22 },
          0.05,
        )
        return tl
      }

      mm.add('(min-width: 768px)', () => {
        buildTimeline(
          wrapRef.current?.querySelector<SVGPathElement>('.pipe-line-h') ?? null,
          wrapRef.current!,
        )
      })
      mm.add('(max-width: 767px)', () => {
        buildTimeline(
          wrapRef.current?.querySelector<SVGPathElement>('.pipe-line-v') ?? null,
          wrapRef.current!,
        )
      })
    },
    { scope: wrapRef },
  )

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-violet">
            El pipeline
          </span>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] text-ink">El viaje de tu PDF</h2>
          <p className="mt-4 text-lg text-ink-soft">
            Cuatro estaciones, cero servidores. Tu archivo nunca sale de esta pestaña.
          </p>
        </Reveal>

        <div ref={wrapRef} className="relative mt-14 pl-10 md:pl-0">
          {/* Línea vertical (móvil) */}
          <svg
            className="absolute bottom-2 left-[7px] top-2 h-[calc(100%-1rem)] w-1.5 md:hidden"
            viewBox="0 0 6 800"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path d="M3 0 V 800" stroke="#E6E2D8" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
            <path className="pipe-line-v" d="M3 0 V 800" stroke="#6C4DF6" strokeWidth="4" strokeLinecap="round" />
          </svg>

          {/* Línea horizontal (desktop) */}
          <svg
            className="absolute left-0 right-0 top-9 hidden h-1.5 w-full md:block"
            viewBox="0 0 1200 6"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            <path d="M0 3 H 1200" stroke="#E6E2D8" strokeWidth="4" strokeDasharray="2 10" strokeLinecap="round" />
            <path className="pipe-line-h" d="M0 3 H 1200" stroke="#6C4DF6" strokeWidth="4" strokeLinecap="round" />
          </svg>

          <ol className="grid gap-6 md:grid-cols-4">
            {STATIONS.map((station, i) => (
              <li
                key={station.title}
                className="pipe-station relative rounded-2xl border border-line bg-white p-6 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-soft">
                    <station.icon className={`h-6 w-6 text-violet ${station.iconAnimation}`} />
                  </span>
                  <span className="font-mono text-sm font-semibold text-ink-soft/50">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg text-ink">{station.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{station.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
