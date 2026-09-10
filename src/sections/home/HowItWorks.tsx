import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { FileDown, SlidersHorizontal, Download } from 'lucide-react'
import Reveal from '@/components/Reveal'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/* ── Gráficos abstractos por paso (SVG animados con scrub) ───────────── */
function GraphicDrop() {
  return (
    <svg viewBox="0 0 120 90" className="h-20 w-28" fill="none" aria-hidden="true">
      <rect x="14" y="52" width="92" height="26" rx="8" stroke="#6C4DF6" strokeWidth="4" strokeDasharray="8 7" />
      <g className="hw-g0">
        <path d="M46 6 h20 l12 12 v26 a4 4 0 0 1 -4 4 H46 a4 4 0 0 1 -4 -4 V10 a4 4 0 0 1 4 -4 z" fill="#fff" stroke="#17141F" strokeWidth="3.5" />
        <path d="M66 6 l12 12 h-12 z" fill="#EAE6FD" />
        <line x1="50" y1="26" x2="70" y2="26" stroke="#E6E2D8" strokeWidth="4" strokeLinecap="round" />
        <line x1="50" y1="35" x2="74" y2="35" stroke="#E6E2D8" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  )
}

function GraphicSliders() {
  return (
    <svg viewBox="0 0 120 90" className="h-20 w-28" fill="none" aria-hidden="true">
      {[22, 45, 68].map((y, i) => (
        <g key={y}>
          <line x1="12" y1={y} x2="108" y2={y} stroke="#E6E2D8" strokeWidth="5" strokeLinecap="round" />
          <circle className={`hw-g1 hw-g1-${i}`} cx={30 + i * 18} cy={y} r="9" fill="#6C4DF6" stroke="#fff" strokeWidth="3" />
        </g>
      ))}
    </svg>
  )
}

function GraphicDownload() {
  return (
    <svg viewBox="0 0 120 90" className="h-20 w-28" fill="none" aria-hidden="true">
      <g className="hw-g2">
        <path d="M38 12 h24 l14 14 v34 a5 5 0 0 1 -5 5 H38 a5 5 0 0 1 -5 -5 V17 a5 5 0 0 1 5 -5 z" fill="#fff" stroke="#17141F" strokeWidth="3.5" />
        <path d="M62 12 l14 14 h-14 z" fill="#EAE6FD" />
      </g>
      <path className="hw-g2-tick" d="M70 52 l12 12 24 -28" stroke="#25C685" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const STEPS = [
  {
    icon: FileDown,
    iconClass: 'bg-violet-soft text-violet',
    title: 'Suelta tu PDF',
    copy: 'Arrastra el archivo o selecciónalo. Se lee directamente en tu navegador con PDF.js.',
    graphic: <GraphicDrop />,
  },
  {
    icon: SlidersHorizontal,
    iconClass: 'bg-violet-soft text-violet',
    title: 'Elige qué hacer',
    copy: 'Comprime con el nivel que prefieras o abre el editor para reorganizar páginas a tu gusto.',
    graphic: <GraphicSliders />,
  },
  {
    icon: Download,
    iconClass: 'bg-mint/15 text-mint',
    title: 'Descarga al instante',
    copy: 'El resultado se genera localmente con pdf-lib y se descarga como un archivo nuevo. Tu original no se toca.',
    graphic: <GraphicDownload />,
  },
]

/** Sección 4 — Cómo funciona (pinned scroll storytelling, GSAP ScrollTrigger). */
export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Desktop: sección pinneada con progreso ligado al scroll
      mm.add('(min-width: 1024px)', () => {
        const steps = gsap.utils.toArray<HTMLElement>('.hw-step')
        const dots = gsap.utils.toArray<HTMLElement>('.hw-dot')

        gsap.set(steps.slice(1), { opacity: 0.25, y: 24 })
        gsap.set(dots.slice(1), { backgroundColor: 'transparent' })

        const tick = ref.current?.querySelector<SVGPathElement>('.hw-g2-tick')
        let tickLen = 0
        if (tick) {
          tickLen = tick.getTotalLength()
          gsap.set(tick, { strokeDasharray: tickLen, strokeDashoffset: tickLen })
        }

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: ref.current,
            start: 'top top',
            end: '+=200%',
            pin: true,
            scrub: 0.6,
          },
        })

        // Relleno del indicador de progreso a lo largo de toda la sección
        tl.fromTo('.hw-fill', { scaleY: 0 }, { scaleY: 1, duration: 3, transformOrigin: 'top center' }, 0)

        // Paso 1: hoja entrando en la dropzone
        tl.fromTo('.hw-g0', { y: -26, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.8 }, 0)
        tl.to(dots[0], { backgroundColor: '#6C4DF6', duration: 0.15 }, 0)

        // Paso 2
        tl.to(steps[0], { opacity: 0.25, y: -24, duration: 0.6 }, 1)
        tl.to(steps[1], { opacity: 1, y: 0, duration: 0.6 }, 1)
        tl.to(dots[1], { backgroundColor: '#6C4DF6', duration: 0.15 }, 1)
        tl.to('.hw-g1-0', { attr: { cx: 78 }, duration: 0.8 }, 1)
        tl.to('.hw-g1-1', { attr: { cx: 40 }, duration: 0.8 }, 1)
        tl.to('.hw-g1-2', { attr: { cx: 92 }, duration: 0.8 }, 1)

        // Paso 3
        tl.to(steps[1], { opacity: 0.25, y: -24, duration: 0.6 }, 2)
        tl.to(steps[2], { opacity: 1, y: 0, duration: 0.6 }, 2)
        tl.to(dots[2], { backgroundColor: '#6C4DF6', duration: 0.15 }, 2)
        if (tick) tl.to(tick, { strokeDashoffset: 0, duration: 0.8 }, 2)
      })

      // Móvil: pasos apilados con reveal estándar
      mm.add('(max-width: 1023px)', () => {
        gsap.utils.toArray<HTMLElement>('.hw-step').forEach((step) => {
          gsap.from(step, {
            y: 40,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: { trigger: step, start: 'top 85%', once: true },
          })
        })
        gsap.set('.hw-dot', { backgroundColor: '#6C4DF6' })
        gsap.set('.hw-fill', { scaleY: 1, transformOrigin: 'top center' })
      })

      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="bg-paper-deep/60">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 md:py-24 lg:h-[100dvh] lg:grid-cols-2 lg:py-0">
        {/* Columna fija: título + progreso */}
        <div>
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet">Cómo funciona</p>
            <h2 className="mt-3 max-w-md text-[clamp(2rem,4vw,3rem)] text-ink">
              Del archivo pesado al PDF perfecto.
            </h2>
          </Reveal>
          <div className="mt-10 flex items-stretch gap-4">
            <div className="relative w-1 overflow-hidden rounded-full bg-line">
              <div className="hw-fill absolute inset-0 rounded-full bg-violet" />
            </div>
            <div className="flex flex-col justify-between gap-8 py-1">
              {STEPS.map((step, i) => (
                <div key={step.title} className="flex items-center gap-3">
                  <span className="hw-dot h-3.5 w-3.5 rounded-full border-2 border-violet" />
                  <span className="font-mono text-xs font-semibold text-ink-soft">0{i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna de pasos */}
        <div className="flex flex-col gap-10 lg:gap-16">
          {STEPS.map((step) => (
            <article key={step.title} className="hw-step flex items-start gap-5">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${step.iconClass}`}>
                <step.icon className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="text-[1.375rem] text-ink">{step.title}</h3>
                <p className="mt-2 max-w-md text-ink-soft">{step.copy}</p>
              </div>
              <div className="hidden shrink-0 sm:block">{step.graphic}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
