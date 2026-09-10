import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Download, FileOutput, Loader2, PencilLine, FilePlus2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/pdf'
import type { PdfEditor } from './usePdfEditor'

/* ── Gauge de éxito (anillo mint + tick dibujado) ─────────── */

function SuccessGauge() {
  const R = 40
  const C = 2 * Math.PI * R
  return (
    <div className="relative mx-auto h-24 w-24">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={R} fill="none" stroke="#EAE6FD" strokeWidth="8" />
        <motion.circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke="#25C685"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, type: 'spring', stiffness: 300, damping: 15 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-white">
          <Check className="h-6 w-6" strokeWidth={3} />
        </span>
      </motion.div>
    </div>
  )
}

/* ── Mini-confetti de hojas (una sola vez) ────────────────── */

function PaperConfetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        x: (i - 4.5) * 22 + (i % 2 === 0 ? 8 : -8),
        delay: i * 0.04,
        rot: (i % 2 === 0 ? 1 : -1) * (40 + i * 9),
        color: i % 3 === 0 ? '#6C4DF6' : i % 3 === 1 ? '#EAE6FD' : '#25C685',
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-x-0 top-6 flex justify-center" aria-hidden>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: -90 - (i % 4) * 18, x: p.x, opacity: 0, rotate: p.rot }}
          transition={{ duration: 1.1, delay: p.delay, ease: 'easeOut' }}
          className="absolute h-3 w-2.5 rounded-[2px]"
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}

/* ── Panel de exportación ──────────────────────────────────── */

export default function ExportPanel({ editor }: { editor: PdfEditor }) {
  const {
    pages,
    range,
    setRange,
    outputName,
    setOutputName,
    exportPdf,
    exporting,
    result,
    continueEditing,
    editAnother,
    changes,
  } = editor

  const summaryParts: string[] = []
  if (changes.deleted > 0) summaryParts.push(`${changes.deleted} eliminada${changes.deleted === 1 ? '' : 's'}`)
  if (changes.rotated > 0) summaryParts.push(`${changes.rotated} rotada${changes.rotated === 1 ? '' : 's'}`)
  if (changes.duplicated > 0) summaryParts.push(`${changes.duplicated} duplicada${changes.duplicated === 1 ? '' : 's'}`)
  if (changes.blanks > 0) summaryParts.push(`${changes.blanks} en blanco`)
  if (changes.reordered) summaryParts.push('reordenadas')

  const clampRange = (field: 'from' | 'to', value: number) => {
    const v = Math.max(1, Math.min(value, pages.length))
    setRange({ ...range, [field]: v })
  }

  return (
    <div className="relative flex flex-col gap-5">
      <AnimatePresence mode="wait">
        {result ? (
          /* ── Estado de éxito ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative flex flex-col items-center gap-4 text-center"
          >
            {/* El bloque se remonta en cada exportación: el confetti se anima una sola vez */}
            <PaperConfetti />
            <SuccessGauge />
            <div>
              <p className="font-display text-lg font-bold text-ink">¡PDF listo!</p>
              <p className="mt-1 font-mono text-xs text-ink-soft">
                {result.pages} páginas · {formatBytes(result.bytes)}
              </p>
            </div>
            <motion.a
              href={result.url}
              download={result.name}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-mint/90"
            >
              <Download className="h-4 w-4" />
              Descargar {result.name}
            </motion.a>
            <div className="flex w-full flex-col gap-2">
              <button
                type="button"
                onClick={continueEditing}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
              >
                <PencilLine className="h-3.5 w-3.5" />
                Seguir editando
              </button>
              <button
                type="button"
                onClick={() => void editAnother()}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
              >
                <FilePlus2 className="h-3.5 w-3.5" />
                Editar otro PDF
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── Configuración de exportación ── */
          <motion.div
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-5"
          >
            <div>
              <h3 className="font-display text-base font-bold text-ink">Exportar</h3>
              <p className="mt-1 text-sm text-ink-soft">
                Nuevo documento:{' '}
                <span className="font-mono font-semibold text-ink">
                  {range.active
                    ? Math.max(0, Math.min(range.to, pages.length) - Math.min(range.from, pages.length) + 1)
                    : pages.length}{' '}
                  páginas
                </span>
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {summaryParts.length > 0 ? summaryParts.join(' · ') : 'Sin cambios todavía'}
              </p>
            </div>

            {/* Extraer rango */}
            <div className="rounded-xl border border-line bg-paper-deep/60 p-3">
              <p className="text-xs font-semibold text-ink">Extraer un rango</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-ink-soft">
                de
                <input
                  type="number"
                  min={1}
                  max={pages.length}
                  value={range.from}
                  onChange={(e) => clampRange('from', Number(e.target.value) || 1)}
                  className="w-16 rounded-lg border border-line bg-white px-2 py-1.5 text-center font-mono text-xs text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/30"
                  aria-label="Página inicial del rango"
                />
                a
                <input
                  type="number"
                  min={1}
                  max={pages.length}
                  value={range.to}
                  onChange={(e) => clampRange('to', Number(e.target.value) || 1)}
                  className="w-16 rounded-lg border border-line bg-white px-2 py-1.5 text-center font-mono text-xs text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/30"
                  aria-label="Página final del rango"
                />
              </div>
              <button
                type="button"
                onClick={() => setRange({ ...range, active: !range.active })}
                className={cn(
                  'mt-2.5 w-full rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                  range.active
                    ? 'bg-violet text-white hover:bg-violet-deep'
                    : 'border border-violet/40 text-violet-deep hover:bg-violet-soft',
                )}
              >
                {range.active ? 'Rango activo — quitar' : 'Usar solo este rango'}
              </button>
              {range.active && (
                <p className="mt-2 text-[11px] text-ink-soft">
                  Las páginas fuera del rango aparecen atenuadas y no se exportarán.
                </p>
              )}
            </div>

            {/* Nombre del archivo */}
            <div>
              <label htmlFor="output-name" className="text-xs font-semibold text-ink">
                Nombre del archivo
              </label>
              <input
                id="output-name"
                type="text"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs text-ink outline-none focus:border-violet focus:ring-2 focus:ring-violet/30"
              />
            </div>

            {/* Botón exportar */}
            <motion.button
              type="button"
              onClick={() => void exportPdf()}
              disabled={exporting || pages.length === 0}
              whileHover={exporting ? undefined : { scale: 1.02 }}
              whileTap={exporting ? undefined : { scale: 0.97 }}
              className="relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-violet px-4 py-3.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-violet-deep disabled:cursor-wait disabled:opacity-70"
            >
              {exporting && (
                <motion.span
                  aria-hidden
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                />
              )}
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Construyendo PDF…
                </>
              ) : (
                <>
                  <FileOutput className="h-4 w-4" />
                  Exportar PDF
                </>
              )}
            </motion.button>
            <p className="text-center text-[11px] text-ink-soft">
              El archivo se genera en tu navegador. Nada se sube a ningún servidor.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
