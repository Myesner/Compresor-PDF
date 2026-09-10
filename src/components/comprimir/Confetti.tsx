import { useMemo } from 'react'
import { motion } from 'framer-motion'

const COLORS = ['#6C4DF6', '#9B7BFF', '#FF5C38', '#25C685', '#FFB020', '#EAE6FD']

/** Mini-hoja de papel SVG. */
function MiniPage({ color }: { color: string }) {
  return (
    <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden>
      <path d="M1 1h11l5 5v15H1V1z" fill={color} opacity="0.9" />
      <path d="M12 1l5 5h-5V1z" fill="#fff" opacity="0.55" />
    </svg>
  )
}

interface ConfettiProps {
  onDone: () => void
}

/**
 * Papel picado sutil: 8 mini-hojas caen con rotación al terminar el lote.
 * Se auto-limpia llamando a onDone al acabar la última animación (~2.5s).
 */
export default function Confetti({ onDone }: ConfettiProps) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        left: 12 + Math.random() * 76, // % horizontal
        delay: Math.random() * 0.4,
        duration: 1.8 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 120,
        rotate: (Math.random() - 0.5) * 540,
        color: COLORS[i % COLORS.length],
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={p.id}
          className="absolute top-0"
          style={{ left: `${p.left}%` }}
          initial={{ y: -30, x: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: '70vh',
            x: p.drift,
            rotate: p.rotate,
            opacity: [1, 1, 1, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          onAnimationComplete={i === pieces.length - 1 ? onDone : undefined}
        >
          <MiniPage color={p.color} />
        </motion.span>
      ))}
    </div>
  )
}
