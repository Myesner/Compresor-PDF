import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FileUp, Move, RotateCw, Scissors, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorDropzoneProps {
  onFile: (file: File) => void
  loading: boolean
}

const FEATURES = [
  { icon: Move, label: 'Reordenar con arrastrar' },
  { icon: RotateCw, label: 'Rotar 90°' },
  { icon: Trash2, label: 'Eliminar páginas' },
  { icon: Scissors, label: 'Extraer un rango' },
]

export default function EditorDropzone({ onFile, loading }: EditorDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const depthRef = useRef(0)

  const pick = () => inputRef.current?.click()

  return (
    <div>
      {/* Dropzone */}
      <motion.div
        role="button"
        tabIndex={0}
        aria-label="Arrastra un PDF o haz clic para elegirlo"
        onClick={pick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            pick()
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          depthRef.current += 1
          setDragOver(true)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => {
          depthRef.current -= 1
          if (depthRef.current <= 0) {
            depthRef.current = 0
            setDragOver(false)
          }
        }}
        onDrop={(e) => {
          e.preventDefault()
          depthRef.current = 0
          setDragOver(false)
          const file = e.dataTransfer.files?.[0]
          if (file) onFile(file)
        }}
        animate={{ scale: dragOver ? 1.01 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        className={cn(
          'flex min-h-[380px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors',
          dragOver ? 'border-solid border-violet bg-violet-soft cursor-copy' : 'border-violet/50 bg-paper-deep',
        )}
      >
        <motion.img
          src={`${import.meta.env.BASE_URL}empty-state.png`}
          alt=""
          animate={dragOver ? { y: -8, scale: 1.05 } : { y: [0, -6, 0] }}
          transition={
            dragOver
              ? { type: 'spring', stiffness: 300, damping: 18 }
              : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
          }
          className="h-36 w-auto object-contain sm:h-44"
        />
        <div>
          <p className="font-display text-xl font-bold text-ink">
            {loading ? 'Abriendo tu PDF…' : 'Arrastra un PDF para empezar a editar'}
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {loading ? 'Renderizando miniaturas en tu navegador.' : 'Se abrirá aquí mismo — nunca sale de tu navegador.'}
          </p>
        </div>
        {!loading && (
          <motion.span
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-xl bg-violet px-5 py-3 text-sm font-semibold text-white shadow-card"
          >
            <FileUp className="h-4 w-4" />
            Elegir PDF
          </motion.span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFile(file)
            e.target.value = ''
          }}
        />
      </motion.div>

      {/* Mini-features */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.5, ease: 'easeOut' }}
            whileHover="hover"
            className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 shadow-card"
          >
            <motion.span
              variants={{ hover: { rotate: -6, scale: 1.1 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-soft text-violet-deep"
            >
              <f.icon className="h-5 w-5" />
            </motion.span>
            <span className="text-xs font-semibold text-ink">{f.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
