import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { renderPageThumbnail, formatBytes } from '@/lib/pdf'
import type { PdfFileItem } from './types'

interface CompareModalProps {
  item: PdfFileItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RENDER_WIDTH = 900

/**
 * Modal "Ver comparación": página 1 del original y del comprimido con
 * slider divisor arrastrable (estilo before/after).
 */
export default function CompareModal({ item, open, onOpenChange }: CompareModalProps) {
  const [beforeImg, setBeforeImg] = useState<string | null>(null)
  const [afterImg, setAfterImg] = useState<string | null>(null)
  const [pos, setPos] = useState(50)
  const [boxWidth, setBoxWidth] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  // Renderiza ambas versiones al abrir
  useEffect(() => {
    if (!open || !item?.result) return
    let cancelled = false
    setBeforeImg(null)
    setAfterImg(null)
    setPos(50)
    Promise.all([
      renderPageThumbnail(item.data, { maxWidth: RENDER_WIDTH, deviceScale: 1 }),
      renderPageThumbnail(item.result.bytes, { maxWidth: RENDER_WIDTH, deviceScale: 1 }),
    ]).then(([b, a]) => {
      if (!cancelled) {
        setBeforeImg(b)
        setAfterImg(a)
      }
    })
    return () => {
      cancelled = true
    }
  }, [open, item])

  // Mide el contenedor para alinear las dos capas
  useEffect(() => {
    if (!open) return
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setBoxWidth(el.clientWidth))
    ro.observe(el)
    setBoxWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [open, beforeImg])

  const updatePos = useCallback((clientX: number) => {
    const el = boxRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(96, Math.max(4, pct)))
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            Comparación: <span className="font-mono text-base font-medium">{item?.file.name}</span>
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div
            ref={boxRef}
            className="relative w-full touch-none select-none overflow-hidden rounded-xl border border-line bg-paper-deep"
            onPointerDown={(e) => {
              dragging.current = true
              ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
              updatePos(e.clientX)
            }}
            onPointerMove={(e) => {
              if (dragging.current) updatePos(e.clientX)
            }}
            onPointerUp={() => {
              dragging.current = false
            }}
            onPointerCancel={() => {
              dragging.current = false
            }}
            role="slider"
            aria-label="Comparar antes y después"
            aria-valuenow={Math.round(pos)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') setPos((p) => Math.max(4, p - 4))
              if (e.key === 'ArrowRight') setPos((p) => Math.min(96, p + 4))
            }}
          >
            {beforeImg && afterImg ? (
              <>
                {/* Capa inferior: DESPUÉS (comprimido) */}
                <img src={afterImg} alt="PDF comprimido" className="block w-full" draggable={false} />
                {/* Capa superior: ANTES (original), recortada por el divisor */}
                <div
                  className="absolute inset-y-0 left-0 overflow-hidden"
                  style={{ width: `${pos}%` }}
                >
                  <img
                    src={beforeImg}
                    alt="PDF original"
                    className="block max-w-none"
                    style={{ width: boxWidth || '100%' }}
                    draggable={false}
                  />
                </div>

                {/* Divisor */}
                <div className="absolute inset-y-0" style={{ left: `${pos}%` }}>
                  <div className="absolute inset-y-0 -ml-px w-0.5 bg-violet" />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="absolute top-1/2 -ml-5 flex h-10 w-10 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-violet text-white shadow-lift"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="m9 18-6-6 6-6" />
                      <path d="m15 6 6 6-6 6" />
                    </svg>
                  </motion.div>
                </div>

                {/* Etiquetas */}
                <span className="absolute left-3 top-3 rounded-full bg-ink/70 px-2.5 py-1 font-mono text-xs font-medium text-white">
                  Antes
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-violet px-2.5 py-1 font-mono text-xs font-medium text-white">
                  Después
                </span>
              </>
            ) : (
              <div className="flex h-72 items-center justify-center text-sm text-ink-soft">
                Renderizando comparación…
              </div>
            )}
          </div>

          {item?.result && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-sm text-ink-soft">
                <span className="text-ink">{formatBytes(item.size)}</span>
                {' → '}
                <span className="font-semibold text-violet-deep">{formatBytes(item.result.size)}</span>
              </p>
              <p className="text-xs text-ink-soft">
                La calidad percibida depende del contenido escaneado.
              </p>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
