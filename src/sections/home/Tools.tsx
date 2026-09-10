import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { motion, useMotionValue, useTransform, useInView, animate } from 'framer-motion'
import { Minimize2, LayoutGrid, ArrowRight } from 'lucide-react'
import Reveal from '@/components/Reveal'
import { cn } from '@/lib/utils'

/* ── Contador animado ────────────────────────────────────────────────── */
export function CountUp({ value, decimals = 1, suffix = '', className }: { value: number; decimals?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => `${v.toFixed(decimals)}${suffix}`)

  useEffect(() => {
    if (!inView) return
    const controls = animate(mv, value, { duration: 1.2, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [inView, value, mv])

  return <motion.span ref={ref} className={className}>{text}</motion.span>
}

/* ── Barra antes/después reutilizable ────────────────────────────────── */
export function SavingsBar({
  before,
  after,
  animateKey = 0,
}: {
  before: number
  after: number
  animateKey?: string | number
}) {
  const ratio = Math.max(0.04, after / before)
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-ink-soft">
          <span>Antes</span>
          <span className="font-mono">{before.toFixed(1)} MB</span>
        </div>
        <div className="h-3.5 w-full overflow-hidden rounded-full bg-paper-deep">
          <motion.div
            key={`b-${animateKey}`}
            initial={{ width: 0 }}
            whileInView={{ width: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-ink-soft/70"
          />
        </div>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-xs font-medium text-ink-soft">
          <span>Después</span>
          <span className="font-mono font-semibold text-violet-deep">{after.toFixed(1)} MB</span>
        </div>
        <div className="h-3.5 w-full overflow-hidden rounded-full bg-paper-deep">
          <motion.div
            key={`a-${animateKey}`}
            initial={{ width: 0 }}
            animate={{ width: `${ratio * 100}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.25 }}
            className="h-full rounded-full bg-violet"
          />
        </div>
      </div>
    </div>
  )
}

/* ── Tarjeta con tilt 3D ─────────────────────────────────────────────── */
function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)

  return (
    <div style={{ perspective: 900 }} className="h-full">
      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          const px = (e.clientX - r.left) / r.width - 0.5
          const py = (e.clientY - r.top) / r.height - 0.5
          rx.set(py * -4)
          ry.set(px * 4)
        }}
        onMouseLeave={() => {
          rx.set(0)
          ry.set(0)
        }}
        className={cn(
          'flex h-full flex-col rounded-2xl border border-line bg-white p-8 shadow-card transition-shadow duration-300 hover:shadow-lift',
          className,
        )}
      >
        {children}
      </motion.div>
    </div>
  )
}

/* ── Mini-demo: miniaturas que se reordenan solas ────────────────────── */
const THUMB_LINES = [
  ['w-4/5', 'w-full', 'w-3/5'],
  ['w-full', 'w-2/3', 'w-4/5'],
  ['w-3/5', 'w-full', 'w-1/2'],
  ['w-2/3', 'w-4/5', 'w-full'],
]

function ReorderDemo() {
  const [order, setOrder] = useState([0, 1, 2, 3])

  useEffect(() => {
    const id = setInterval(() => {
      setOrder((prev) => {
        const next = [...prev]
        const i = Math.floor(Math.random() * next.length)
        const j = (i + 1 + Math.floor(Math.random() * (next.length - 1))) % next.length
        ;[next[i], next[j]] = [next[j], next[i]]
        return next
      })
    }, 3000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="grid grid-cols-4 gap-3" aria-hidden="true">
      {order.map((id) => (
        <motion.div
          key={id}
          layout
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="flex aspect-[3/4] flex-col gap-1.5 rounded-lg border border-line bg-white p-2.5 shadow-xs"
        >
          <span className="mb-0.5 ml-auto h-2 w-2 rounded-sm bg-violet-soft" />
          {THUMB_LINES[id].map((w, i) => (
            <span key={i} className={cn('h-1 rounded-full bg-line', w)} />
          ))}
        </motion.div>
      ))}
    </div>
  )
}

/* ── Sección: Dos herramientas ───────────────────────────────────────── */
export default function Tools() {
  return (
    <section className="bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet">Herramientas</p>
          <h2 className="mt-3 text-[clamp(2rem,4vw,3rem)] text-ink">Dos herramientas, cero fricción.</h2>
        </Reveal>

        <Reveal staggerChildren stagger={0.15} y={60} duration={0.8} className="mt-12 grid gap-8 md:grid-cols-2">
          {/* Card A — Comprimir */}
          <TiltCard>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-soft">
              <Minimize2 className="h-7 w-7 text-coral" />
            </span>
            <h3 className="mt-6 text-[1.375rem] text-ink">Comprimir PDF</h3>
            <p className="mt-3 text-ink-soft">
              Reduce hasta un 90% el peso sin perder legibilidad. Tres niveles de
              compresión, varios archivos a la vez.
            </p>
            <div className="mt-6 rounded-xl bg-paper p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-soft">Ejemplo realista</span>
                <span className="rounded-full bg-coral px-2.5 py-1 font-mono text-xs font-semibold text-white">
                  -77%
                </span>
              </div>
              <SavingsBar before={8.4} after={1.9} />
            </div>
            <Link
              to="/comprimir"
              className="group mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold text-violet-deep"
            >
              Comprimir ahora
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </TiltCard>

          {/* Card B — Editor */}
          <TiltCard>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-soft">
              <LayoutGrid className="h-7 w-7 text-violet" />
            </span>
            <h3 className="mt-6 text-[1.375rem] text-ink">Editor de páginas</h3>
            <p className="mt-3 text-ink-soft">
              Arrastra para reordenar, rota, duplica o elimina páginas. Extrae solo
              las que necesitas y exporta un PDF nuevo.
            </p>
            <div className="mt-6 rounded-xl bg-paper p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-ink-soft">
                Reordenar es arrastrar
              </p>
              <ReorderDemo />
            </div>
            <Link
              to="/editor"
              className="group mt-auto inline-flex items-center gap-1.5 pt-6 font-semibold text-violet-deep"
            >
              Abrir el editor
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </TiltCard>
        </Reveal>
      </div>
    </section>
  )
}
