import { useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { formatBytes } from '@/lib/pdf'

interface SavingsBarProps {
  before: number
  after: number
  /** Animar entrada (crecimiento de barras + conteo). */
  animateIn?: boolean
}

/** Texto Mono que cuenta desde 0 hasta `value` formateado como bytes. */
function CountBytes({ value }: { value: number }) {
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => formatBytes(v))
  useEffect(() => {
    const controls = animate(mv, value, { duration: 1, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [mv, value])
  return <motion.span>{text}</motion.span>
}

/**
 * Comparativa antes/después: barra "Antes" (ink-soft, 100%) y "Después"
 * (violet, proporcional) con contadores animados y badge coral -XX%.
 */
export default function SavingsBar({ before, after, animateIn = true }: SavingsBarProps) {
  const ratio = before > 0 ? Math.min(1, after / before) : 1
  const savedPct = before > 0 ? Math.max(0, Math.round((1 - after / before) * 100)) : 0

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-3">
        <div className="flex-1 space-y-2">
          {/* Antes */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-ink-soft">Antes</span>
              <span className="font-mono font-medium text-ink-soft">
                {animateIn ? <CountBytes value={before} /> : formatBytes(before)}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-paper-deep">
              <motion.div
                className="h-full rounded-full bg-ink-soft/60"
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
          {/* Después */}
          <div>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium text-violet-deep">Después</span>
              <span className="font-mono font-semibold text-violet-deep">
                {animateIn ? <CountBytes value={after} /> : formatBytes(after)}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-paper-deep">
              <motion.div
                className="h-full rounded-full bg-violet"
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max(2, ratio * 100)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              />
            </div>
          </div>
        </div>

        {/* Badge de ahorro */}
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.35 }}
          className="shrink-0 rounded-full bg-coral px-3 py-1.5 font-mono text-sm font-semibold text-white shadow-sm"
        >
          {savedPct > 0 ? `-${savedPct}%` : '±0%'}
        </motion.span>
      </div>
    </div>
  )
}
