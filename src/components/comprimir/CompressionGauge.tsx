import { motion } from 'framer-motion'
import { STAGE_LABELS } from './types'
import type { PdfFileItem } from './types'

const SIZE = 120
const STROKE = 10
const R = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * R

/** Anillo SVG de progreso con porcentaje central; al completar pasa a mint con tick. */
export default function CompressionGauge({ item }: { item: PdfFileItem }) {
  const done = item.status === 'done'
  const pct = Math.round(item.progress * 100)

  return (
    <motion.div
      layout
      animate={done ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={done ? { type: 'spring', stiffness: 300, damping: 18 } : undefined}
      className="flex flex-col items-center rounded-2xl border border-line bg-white p-5 shadow-card"
    >
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#E6E2D8" strokeWidth={STROKE} />
          <motion.circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            stroke={done ? '#25C685' : '#6C4DF6'}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={false}
            animate={{ strokeDashoffset: CIRC * (1 - item.progress), stroke: done ? '#25C685' : '#6C4DF6' }}
            transition={{ ease: 'easeOut', duration: 0.4 }}
          />
          {done && (
            <motion.path
              d={`M ${SIZE / 2 - 16} ${SIZE / 2 + 2} l 11 12 l 23 -26`}
              fill="none"
              stroke="#25C685"
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="rotate-90"
              style={{ transformOrigin: 'center' }}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            />
          )}
        </svg>
        {!done && (
          <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-semibold text-ink">
            {pct}%
          </span>
        )}
      </div>
      <p className="mt-3 max-w-full truncate px-2 font-mono text-sm font-medium text-ink" title={item.file.name}>
        {item.file.name}
      </p>
      <motion.p
        key={item.stage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mt-1 text-xs text-ink-soft"
      >
        {STAGE_LABELS[item.stage]}
      </motion.p>
    </motion.div>
  )
}
