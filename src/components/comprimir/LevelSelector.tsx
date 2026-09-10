import { motion, AnimatePresence } from 'framer-motion'
import { TriangleAlert } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { CompressionLevel } from './compress'

interface LevelOption {
  id: CompressionLevel
  label: string
  description: string
  estimate: string
}

const LEVELS: LevelOption[] = [
  { id: 'ligera', label: 'Ligera', description: 'Máxima calidad', estimate: '≈ -45%' },
  { id: 'recomendada', label: 'Recomendada', description: 'Equilibrio ideal', estimate: 'objetivo -80%' },
  { id: 'extrema', label: 'Extrema', description: 'Mínimo peso', estimate: 'objetivo -90%' },
]

interface LevelSelectorProps {
  level: CompressionLevel
  onLevelChange: (level: CompressionLevel) => void
  stripMetadata: boolean
  onStripMetadataChange: (v: boolean) => void
  disabled?: boolean
}

/** Control segmentado de 3 niveles con indicador deslizante + toggle de metadatos. */
export default function LevelSelector({
  level,
  onLevelChange,
  stripMetadata,
  onStripMetadataChange,
  disabled,
}: LevelSelectorProps) {
  return (
    <div className={cn(disabled && 'pointer-events-none opacity-60')}>
      <p className="text-sm font-semibold text-ink">Nivel de compresión</p>

      <div
        role="radiogroup"
        aria-label="Nivel de compresión"
        className="mt-2 grid grid-cols-3 gap-1 rounded-2xl border border-line bg-paper-deep p-1"
      >
        {LEVELS.map((opt) => {
          const active = level === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onLevelChange(opt.id)}
              className={cn(
                'relative flex flex-col items-center rounded-xl px-2 py-3 text-center transition-colors',
                active ? 'text-ink' : 'text-ink-soft hover:text-ink',
              )}
            >
              {active && (
                <motion.span
                  layoutId="level-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-white shadow-card"
                />
              )}
              <span className="relative font-display text-sm font-medium">{opt.label}</span>
              <span className="relative mt-0.5 hidden text-xs text-ink-soft sm:block">
                {opt.description}
              </span>
              <AnimatePresence>
                {active && (
                  <motion.span
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative mt-1 inline-block rounded-full bg-violet-soft px-2 py-0.5 font-mono text-[0.7rem] font-semibold text-violet-deep"
                  >
                    {opt.estimate}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )
        })}
      </div>

      {/* Aviso del nivel Extrema */}
      <AnimatePresence>
        {level === 'extrema' && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <span className="mt-2 flex items-center gap-2 rounded-xl bg-amber/10 px-3 py-2 text-xs font-medium text-amber">
              <TriangleAlert className="h-4 w-4 shrink-0" />
              Puede reducir la calidad de las imágenes del documento.
            </span>
          </motion.p>
        )}
      </AnimatePresence>

      {/* Toggle metadatos */}
      <label className="mt-4 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-white px-4 py-3">
        <span>
          <span className="block text-sm font-medium text-ink">Eliminar metadatos y anotaciones</span>
          <span className="block text-xs text-ink-soft">
            Quita autor, fechas, software creador y comentarios del archivo.
          </span>
        </span>
        <Switch
          checked={stripMetadata}
          onCheckedChange={onStripMetadataChange}
          aria-label="Eliminar metadatos y anotaciones"
        />
      </label>
    </div>
  )
}
