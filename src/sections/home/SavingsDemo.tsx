import { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Slider } from '@/components/ui/slider'
import Reveal from '@/components/Reveal'
import { SavingsBar } from '@/sections/home/Tools'
import { cn } from '@/lib/utils'

const LEVELS = [
  { id: 'ligera', label: 'Ligera', pct: 45, desc: 'Máxima calidad' },
  { id: 'recomendada', label: 'Recomendada', pct: 72, desc: 'El punto justo' },
  { id: 'extrema', label: 'Extrema', pct: 88, desc: 'Mínimo peso' },
] as const

type LevelId = (typeof LEVELS)[number]['id']

/** Sección 6 — Calculadora interactiva de ahorro. */
export default function SavingsDemo() {
  const [size, setSize] = useState(12)
  const [levelId, setLevelId] = useState<LevelId>('recomendada')
  const level = LEVELS.find((l) => l.id === levelId) ?? LEVELS[1]

  const result = size * (1 - level.pct / 100)
  const saved = size - result

  const resultMv = useMotionValue(result)
  const savedMv = useMotionValue(saved)
  const resultText = useTransform(resultMv, (v) => v.toFixed(1))
  const savedText = useTransform(savedMv, (v) => v.toFixed(1))

  useEffect(() => {
    const c1 = animate(resultMv, result, { duration: 0.4, ease: 'easeOut' })
    const c2 = animate(savedMv, saved, { duration: 0.4, ease: 'easeOut' })
    return () => {
      c1.stop()
      c2.stop()
    }
  }, [result, saved, resultMv, savedMv])

  return (
    <section className="bg-paper-deep py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal y={50} className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-line bg-white p-8 shadow-card md:p-10">
            <h3 className="text-center text-[1.375rem] text-ink md:text-2xl">¿Cuánto puedes ahorrar?</h3>

            {/* Slider de tamaño */}
            <div className="mt-10">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="font-medium text-ink-soft">Tamaño original</span>
                <span className="font-mono font-semibold text-ink">{size.toFixed(1)} MB</span>
              </div>
              <Slider
                value={[size]}
                onValueChange={([v]) => setSize(v)}
                min={0.5}
                max={100}
                step={0.5}
                aria-label="Tamaño original del PDF en megabytes"
              />
              <div className="mt-2 flex justify-between font-mono text-xs text-ink-soft">
                <span>0.5 MB</span>
                <span>100 MB</span>
              </div>
            </div>

            {/* Selector de nivel */}
            <div className="mt-8 grid grid-cols-3 gap-1 rounded-xl bg-paper-deep p-1">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevelId(l.id)}
                  className={cn(
                    'relative rounded-lg px-2 py-2.5 text-center transition-colors',
                    levelId === l.id ? 'text-violet-deep' : 'text-ink-soft hover:text-ink',
                  )}
                >
                  {levelId === l.id && (
                    <motion.span
                      layoutId="level-pill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-lg bg-white shadow-xs"
                    />
                  )}
                  <span className="relative block text-sm font-semibold">{l.label}</span>
                  <span className="relative mt-0.5 block text-[0.7rem] opacity-70">{l.desc}</span>
                </button>
              ))}
            </div>

            {/* Salida en vivo */}
            <div className="mt-10 flex flex-col items-center">
              <div className="flex items-end gap-3">
                <span className="font-mono text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-none text-ink">
                  <motion.span>{resultText}</motion.span>
                  <span className="ml-1 text-[0.45em] text-ink-soft">MB</span>
                </span>
                <motion.span
                  key={level.id}
                  initial={{ scale: 1.15 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="rounded-full bg-coral px-3 py-1 font-mono text-sm font-semibold text-white"
                >
                  -{level.pct}%
                </motion.span>
              </div>
              <p className="mt-3 text-sm text-ink-soft">
                ≈ <motion.span className="font-mono font-semibold text-ink">{savedText}</motion.span> MB que dejas de
                adjuntar por correo
              </p>
            </div>

            <div className="mt-8">
              <SavingsBar before={size} after={result} animateKey={level.id} />
            </div>

            <p className="mt-6 text-center text-xs text-ink-soft">
              Estimación orientativa: el ahorro real depende del contenido de cada PDF.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
