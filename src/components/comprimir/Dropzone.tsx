import { useCallback, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DropzoneProps {
  /** Compacta (franja) cuando ya hay archivos cargados. */
  compact: boolean
  onFiles: (files: File[]) => void
  disabled?: boolean
}

/**
 * Dropzone de PDFs: borde dashed que "respira", estado drag-over con
 * etiqueta "¡Suéltalo!" y entrada animada. Acepta múltiples archivos.
 */
export default function Dropzone({ compact, onFiles, disabled = false }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const depth = useRef(0)

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      depth.current = 0
      setDragOver(false)
      if (disabled) return
      const files = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
      )
      if (files.length > 0) onFiles(files)
    },
    [disabled, onFiles],
  )

  return (
    <motion.div
      layout
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(dragOver && !disabled ? 'cursor-copy' : '')}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault()
          depth.current += 1
          if (!disabled) setDragOver(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault()
          depth.current -= 1
          if (depth.current <= 0) setDragOver(false)
        }}
        onDrop={handleDrop}
        className={cn(
          'relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 text-center transition-colors duration-300',
          compact ? 'min-h-[120px] p-4' : 'min-h-[320px] p-6 md:p-10',
          dragOver && !disabled
            ? 'border-solid border-violet bg-violet-soft'
            : 'border-dashed border-violet/50 bg-paper-deep hover:border-violet hover:bg-violet-soft/40',
          disabled && 'cursor-not-allowed opacity-60',
        )}
        aria-label="Zona para soltar o seleccionar archivos PDF"
      >
        {/* Borde "respirando" */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0 rounded-2xl border-2 border-dashed border-violet animate-breathe',
            dragOver && 'hidden',
          )}
        />

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? [])
            if (files.length > 0) onFiles(files)
            e.target.value = ''
          }}
        />

        <AnimatePresence mode="wait">
          {compact ? (
            <motion.div
              key="compact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 text-left"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-soft text-violet">
                <FileUp className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-base font-medium text-ink">
                  {dragOver ? '¡Suéltalos aquí!' : 'Añadir más PDFs'}
                </span>
                <span className="block text-sm text-ink-soft">
                  Arrastra o haz clic para seleccionar
                </span>
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.img
                src={`${import.meta.env.BASE_URL}empty-state.png`}
                alt=""
                animate={{ scale: dragOver ? 1.05 : 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-48 md:w-60"
                draggable={false}
              />
              <AnimatePresence mode="wait">
                {dragOver ? (
                  <motion.p
                    key="drop"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mt-4 font-display text-2xl font-bold text-violet"
                  >
                    ¡Suéltalo!
                  </motion.p>
                ) : (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    <p className="mt-4 font-display text-xl font-bold text-ink md:text-2xl">
                      Arrastra tus PDF aquí
                    </p>
                    <p className="mt-1 text-ink-soft">
                      o <span className="font-semibold text-violet underline underline-offset-4">haz clic para seleccionar</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="mt-3 font-mono text-[0.8125rem] text-ink-soft/80">
                Solo archivos .pdf · puedes soltar varios
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  )
}
