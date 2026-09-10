import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Lock, Archive } from 'lucide-react'
import { toast, Toaster } from 'sonner'
import { takeStashedFiles } from '@/lib/fileTransfer'
import { formatBytes, renderPageThumbnail } from '@/lib/pdf'
import Dropzone from '@/components/comprimir/Dropzone'
import FileList from '@/components/comprimir/FileList'
import LevelSelector from '@/components/comprimir/LevelSelector'
import CompressionGauge from '@/components/comprimir/CompressionGauge'
import ResultsSection from '@/components/comprimir/ResultsSection'
import CompareModal from '@/components/comprimir/CompareModal'
import Confetti from '@/components/comprimir/Confetti'
import ComprimirFaq from '@/components/comprimir/ComprimirFaq'
import { compressPdf, compressedName } from '@/components/comprimir/compress'
import type { CompressionLevel } from '@/components/comprimir/compress'
import { newId } from '@/components/comprimir/types'
import type { PdfFileItem } from '@/components/comprimir/types'

type Phase = 'editing' | 'processing' | 'done'

/** Brillo que recorre el botón primario (animación infinita aislada y memoizada). */
const Shine = memo(function Shine() {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent"
      animate={{ x: ['-150%', '350%'] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
})

function looksEncrypted(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()
  return msg.includes('encrypt') || msg.includes('password')
}

export default function Comprimir() {
  const [items, setItems] = useState<PdfFileItem[]>([])
  const [level, setLevel] = useState<CompressionLevel>('recomendada')
  const [stripMetadata, setStripMetadata] = useState(false)
  const [phase, setPhase] = useState<Phase>('editing')
  const [showConfetti, setShowConfetti] = useState(false)
  const [compareItem, setCompareItem] = useState<PdfFileItem | null>(null)
  const [compareOpen, setCompareOpen] = useState(false)
  const processingRef = useRef(false)

  const updateItem = useCallback((id: string, patch: Partial<PdfFileItem>) => {
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const addFiles = useCallback(
    async (files: File[]) => {
      const pdfs = files.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
      const rejected = files.length - pdfs.length
      if (rejected > 0) {
        toast.error(`${rejected === 1 ? 'Un archivo' : `${rejected} archivos`} no ${rejected === 1 ? 'es' : 'son'} PDF y se ${rejected === 1 ? 'ignoró' : 'ignoraron'}.`)
      }
      if (pdfs.length === 0) return

      const loaded: PdfFileItem[] = []
      for (const file of pdfs) {
        try {
          const buf = await file.arrayBuffer()
          loaded.push({
            id: newId(),
            file,
            data: new Uint8Array(buf),
            size: file.size,
            thumb: null,
            status: 'ready',
            stage: 'analizando',
            progress: 0,
          })
        } catch {
          toast.error(`No se pudo leer «${file.name}».`)
        }
      }
      if (loaded.length === 0) return

      setItems((prev) => [...prev, ...loaded])

      // Miniaturas con PDF.js (blur-in al llegar)
      for (const item of loaded) {
        renderPageThumbnail(item.data, { maxWidth: 56, deviceScale: 2 })
          .then((thumb) => updateItem(item.id, { thumb }))
          .catch(() => updateItem(item.id, { thumb: null }))
      }
    },
    [updateItem],
  )

  // Consumir archivos soltados en el hero de la home
  useEffect(() => {
    const stashed = takeStashedFiles()
    if (stashed.length > 0) {
      void addFiles(stashed)
      toast.success(
        stashed.length === 1
          ? 'PDF añadido desde la página de inicio.'
          : `${stashed.length} PDFs añadidos desde la página de inicio.`,
      )
    }
  }, [addFiles])

  const removeItem = useCallback(
    (id: string) => {
      if (processingRef.current) return
      setItems((prev) => prev.filter((p) => p.id !== id))
    },
    [],
  )

  const compressAll = useCallback(async () => {
    if (processingRef.current) return
    const queue = items.filter((i) => i.status === 'ready')
    if (queue.length === 0) return
    processingRef.current = true
    setPhase('processing')
    setShowConfetti(false)

    for (const item of queue) {
      updateItem(item.id, { status: 'processing', stage: 'analizando', progress: 0.02 })
      try {
        const res = await compressPdf(
          item.data,
          { level, stripMetadata },
          (p) => updateItem(item.id, { stage: p.stage, progress: p.progress }),
        )
        updateItem(item.id, {
          status: 'done',
          stage: 'listo',
          progress: 1,
          result: {
            bytes: res.bytes,
            size: res.compressedSize,
            name: compressedName(item.file.name),
            noGain: res.noGain,
          },
        })
      } catch (err) {
        const msg = looksEncrypted(err)
          ? 'PDF protegido con contraseña: no podemos abrirlo.'
          : 'No se pudo procesar (archivo dañado o formato no soportado).'
        toast.error(`«${item.file.name}»: ${msg}`)
        updateItem(item.id, { status: 'ready', progress: 0, error: msg })
      }
    }

    processingRef.current = false
    setPhase('done')
    setShowConfetti(true)
  }, [items, level, stripMetadata, updateItem])

  const reset = useCallback(() => {
    setItems([])
    setPhase('editing')
    setShowConfetti(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const readyItems = items.filter((i) => i.status === 'ready')
  const readyCount = readyItems.length
  const readySize = readyItems.reduce((acc, i) => acc + i.size, 0)
  const batchItems = items.filter((i) => i.status === 'processing' || i.status === 'done')

  return (
    <>
      <Toaster position="bottom-right" richColors closeButton />

      {/* ── Sección 1: cabecera de herramienta ─────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-12 md:pt-16">
        <nav aria-label="Migas de pan" className="flex items-center gap-1 text-sm text-ink-soft">
          <Link to="/" className="transition-colors hover:text-violet-deep">
            Inicio
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden />
          <span className="font-medium text-ink" aria-current="page">
            Comprimir
          </span>
        </nav>

        <h1
          className="mt-4 font-display font-bold tracking-tight"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
        >
          {'Comprimir PDF'.split(' ').map((word, i) => (
            <motion.span
              key={word}
              className="inline-block"
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.5, ease: 'easeOut' }}
            >
              {word}
              {i === 0 ? ' ' : ''}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-3 max-w-2xl text-lg text-ink-soft"
        >
          Baja el peso de tus documentos sin perder legibilidad. Varios archivos a la vez, todo en tu navegador.
        </motion.p>

        <motion.span
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-mint/10 px-3.5 py-1.5 text-sm font-semibold text-mint"
        >
          <Lock className="h-4 w-4" aria-hidden />
          Procesamiento local — nada se sube
        </motion.span>
      </section>

      {/* ── Sección 2: zona de trabajo ─────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="relative rounded-3xl bg-white p-6 shadow-card md:p-10">
          {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}

          <AnimatePresence mode="wait">
            {phase === 'processing' ? (
              /* ── Sección 3: procesando ── */
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="font-display text-xl font-bold tracking-tight">Comprimiendo tus PDF…</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Todo ocurre en tu dispositivo. No cierres esta pestaña.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {batchItems.map((item) => (
                    <CompressionGauge key={item.id} item={item} />
                  ))}
                </div>
              </motion.div>
            ) : (
              /* ── Estados vacío / con archivos ── */
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <Dropzone compact={items.length > 0} onFiles={addFiles} />

                {items.length > 0 && (
                  <>
                    <FileList items={items.filter((i) => i.status === 'ready')} onRemove={removeItem} disabled={phase !== 'editing'} />

                    <div className="mt-6">
                      <LevelSelector
                        level={level}
                        onLevelChange={setLevel}
                        stripMetadata={stripMetadata}
                        onStripMetadataChange={setStripMetadata}
                        disabled={phase !== 'editing'}
                      />
                    </div>

                    <motion.button
                      type="button"
                      layout
                      onClick={compressAll}
                      disabled={readyCount === 0}
                      whileHover={readyCount > 0 ? { scale: 1.02 } : undefined}
                      whileTap={readyCount > 0 ? { scale: 0.97 } : undefined}
                      className="relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-violet px-6 py-4 font-display text-base font-bold text-white shadow-lift transition-colors hover:bg-violet-deep disabled:cursor-not-allowed disabled:opacity-50 md:text-lg"
                    >
                      {readyCount > 0 && <Shine />}
                      <Archive className="h-5 w-5" aria-hidden />
                      Comprimir {readyCount} {readyCount === 1 ? 'archivo' : 'archivos'} ({formatBytes(readySize)})
                    </motion.button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Sección 4: resultados ── */}
          {phase === 'done' && (
            <ResultsSection
              items={items}
              onCompare={(item) => {
                setCompareItem(item)
                setCompareOpen(true)
              }}
              onReset={reset}
            />
          )}
        </div>
      </section>

      {/* ── Sección 5: modal de comparación ── */}
      <CompareModal item={compareItem} open={compareOpen} onOpenChange={setCompareOpen} />

      {/* ── Sección 6: FAQ + CTA cruzado ── */}
      <ComprimirFaq />
    </>
  )
}
