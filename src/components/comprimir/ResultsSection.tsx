import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import JSZip from 'jszip'
import { Check, Download, FileText, Package, RotateCcw } from 'lucide-react'
import { formatBytes } from '@/lib/pdf'
import { compressedName, downloadBytes, triggerDownload } from './compress'
import SavingsBar from './SavingsBar'
import type { PdfFileItem } from './types'

interface ResultsSectionProps {
  items: PdfFileItem[]
  onCompare: (item: PdfFileItem) => void
  onReset: () => void
}

/** Botón de descarga con feedback "¡Descargado!" durante 2s. */
function DownloadButton({ item }: { item: PdfFileItem }) {
  const [downloaded, setDownloaded] = useState(false)
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => {
        if (!item.result) return
        downloadBytes(item.result.bytes, item.result.name)
        setDownloaded(true)
        setTimeout(() => setDownloaded(false), 2000)
      }}
      className="inline-flex items-center gap-2 rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-deep"
    >
      {downloaded ? (
        <>
          <Check className="h-4 w-4 text-mint" /> ¡Descargado!
        </>
      ) : (
        <>
          <Download className="h-4 w-4" /> Descargar
        </>
      )}
    </motion.button>
  )
}

/** Lista de resultados + resumen global con descarga en lote (.zip). */
export default function ResultsSection({ items, onCompare, onReset }: ResultsSectionProps) {
  const done = items.filter((i) => i.status === 'done' && i.result)
  if (done.length === 0) return null

  const totalBefore = done.reduce((acc, i) => acc + i.size, 0)
  const totalAfter = done.reduce((acc, i) => acc + (i.result?.size ?? i.size), 0)
  const totalSavedPct = totalBefore > 0 ? Math.max(0, Math.round((1 - totalAfter / totalBefore) * 100)) : 0

  const downloadAll = async () => {
    const zip = new JSZip()
    for (const item of done) {
      if (item.result) zip.file(item.result.name, item.result.bytes)
    }
    const blob = await zip.generateAsync({ type: 'blob' })
    triggerDownload(blob, 'pdfacil-comprimidos.zip')
  }

  return (
    <div className="mt-8">
      <h2 className="font-display text-2xl font-bold tracking-tight">
        Resultados <span className="text-mint">({done.length})</span>
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        <AnimatePresence>
          {done.map((item, i) => (
            <motion.article
              key={item.id}
              layout
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: i * 0.12, ease: 'easeOut' }}
              className="rounded-2xl border border-line bg-white p-5 shadow-card"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center">
                <div className="flex min-w-0 items-center gap-4 md:w-64 md:shrink-0">
                  <div className="flex h-[72px] w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-paper-deep">
                    {item.thumb ? (
                      <img src={item.thumb} alt="" className="h-full w-full object-cover" draggable={false} />
                    ) : (
                      <FileText className="h-6 w-6 text-violet/50" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-medium text-ink" title={item.result?.name}>
                      {item.result?.name ?? compressedName(item.file.name)}
                    </p>
                    {item.result?.noGain && (
                      <p className="mt-1 text-xs text-amber">Ya estaba muy optimizado</p>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <SavingsBar before={item.size} after={item.result?.size ?? item.size} />
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <DownloadButton item={item} />
                  <button
                    type="button"
                    onClick={() => onCompare(item)}
                    className="rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-violet hover:text-violet-deep"
                  >
                    Ver comparación
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>

      {/* Resumen global (si hay más de un archivo) */}
      {done.length > 1 && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: done.length * 0.12, ease: 'easeOut' }}
          className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl bg-violet-soft p-6 sm:flex-row sm:items-center"
        >
          <div>
            <p className="text-sm font-medium text-violet-deep">Total del lote</p>
            <p className="mt-1 font-mono text-xl font-semibold text-ink">
              {formatBytes(totalBefore)} → {formatBytes(totalAfter)}{' '}
              <span className="ml-1 rounded-full bg-coral px-2 py-0.5 align-middle text-sm text-white">
                -{totalSavedPct}%
              </span>
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={downloadAll}
            className="inline-flex items-center gap-2 rounded-xl bg-violet px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-deep"
          >
            <Package className="h-4 w-4" /> Descargar todo (.zip)
          </motion.button>
        </motion.div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-violet-deep underline-offset-4 hover:underline"
      >
        <RotateCcw className="h-4 w-4" /> Comprimir más archivos
      </button>
    </div>
  )
}
