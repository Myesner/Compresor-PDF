import { useRef } from 'react'
import { Reorder, motion, useDragControls } from 'framer-motion'
import { Copy, FilePlus2, Loader2, RotateCw, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EditorPage } from './usePdfEditor'

interface PageThumbProps {
  page: EditorPage
  /** Número de posición actual (base 1). */
  position: number
  thumb: string | null
  selected: boolean
  dimmed: boolean
  onSelect: (id: string, opts: { ctrl: boolean; shift: boolean }) => void
  onRotate: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onDragStart: () => void
}

/**
 * Miniatura de página: render PDF.js, arrastrable (Reorder) con long-press
 * táctil, overlay de acciones en hover y rotación animada.
 */
export default function PageThumb({
  page,
  position,
  thumb,
  selected,
  dimmed,
  onSelect,
  onRotate,
  onDuplicate,
  onDelete,
  onDragStart,
}: PageThumbProps) {
  const controls = useDragControls()
  const pressTimer = useRef<number | null>(null)
  const draggedRef = useRef(false)

  const clearPressTimer = () => {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') {
      // Móvil: long-press 300ms inicia el arrastre (con vibración si hay soporte)
      clearPressTimer()
      pressTimer.current = window.setTimeout(() => {
        if ('vibrate' in navigator) navigator.vibrate(10)
        controls.start(e)
      }, 300)
    } else {
      controls.start(e)
    }
  }

  const landscape = page.rot % 180 !== 0
  const aspect = landscape ? `${page.h} / ${page.w}` : `${page.w} / ${page.h}`
  // Tamaño del contenido interno para que, al rotar, cubra el contenedor
  const innerW = landscape ? `${(page.w / page.h) * 100}%` : '100%'
  const innerH = landscape ? `${(page.h / page.w) * 100}%` : '100%'

  // El chip "orig." solo tiene sentido para páginas del documento principal.
  const originalLabel =
    page.doc !== 1 && page.src !== null && page.src + 1 !== position ? `orig. ${page.src + 1}` : null

  return (
    <Reorder.Item
      value={page}
      dragListener={false}
      dragControls={controls}
      layout
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.6, opacity: 0 }}
      whileDrag={{ scale: 1.06, rotate: 2, zIndex: 30, boxShadow: '0 2px 4px rgba(23,20,31,.08), 0 16px 48px rgba(108,77,246,.18)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onDragStart={() => {
        draggedRef.current = true
        onDragStart()
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={clearPressTimer}
      onPointerLeave={clearPressTimer}
      onPointerCancel={clearPressTimer}
      onClick={(e) => {
        // Ignorar el clic que sigue a un arrastre
        if (draggedRef.current) {
          draggedRef.current = false
          return
        }
        onSelect(page.id, { ctrl: e.ctrlKey || e.metaKey, shift: e.shiftKey })
      }}
      style={{ aspectRatio: aspect, touchAction: 'pan-y' }}
      className={cn(
        'group relative select-none overflow-hidden rounded-xl border bg-white shadow-card',
        selected ? 'border-violet ring-[3px] ring-violet' : 'border-line',
        dimmed && 'opacity-35',
        'cursor-grab active:cursor-grabbing',
      )}
      aria-label={`Página ${position}`}
      role="button"
      aria-pressed={selected}
    >
      {/* Contenido rotado */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ width: innerW, height: innerH, x: '-50%', y: '-50%' }}
        animate={{ rotate: page.rot }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        {page.src === null ? (
          <div className="flex h-full w-full items-center justify-center bg-white p-2">
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line text-ink-soft">
              <FilePlus2 className="h-5 w-5" />
              <span className="px-1 text-center text-[10px] font-medium">En blanco</span>
            </div>
          </div>
        ) : thumb ? (
          <img src={thumb} alt="" draggable={false} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-paper-deep">
            <Loader2 className="h-5 w-5 animate-spin text-violet/60" />
          </div>
        )}
      </motion.div>

      {/* Chip número de página */}
      <span
        className={cn(
          'absolute bottom-1.5 left-1.5 z-10 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold transition-colors',
          selected ? 'bg-violet text-white' : 'bg-ink/70 text-white',
        )}
      >
        {position}
      </span>
      {originalLabel && (
        <span className="absolute bottom-1.5 right-1.5 z-10 rounded-md bg-white/85 px-1.5 py-0.5 font-mono text-[9px] text-ink-soft">
          {originalLabel}
        </span>
      )}

      {/* Overlay de acciones (hover, desktop) */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center gap-2 bg-ink/40 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        {[
          { icon: RotateCw, label: 'Rotar 90°', fn: () => onRotate(page.id), danger: false },
          { icon: Copy, label: 'Duplicar', fn: () => onDuplicate(page.id), danger: false },
          { icon: Trash2, label: 'Eliminar', fn: () => onDelete(page.id), danger: true },
        ].map((btn, i) => (
          <motion.button
            key={btn.label}
            type="button"
            initial={{ scale: 0.6 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.92 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 20 }}
            onClick={(e) => {
              e.stopPropagation()
              btn.fn()
            }}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`${btn.label} página ${position}`}
            title={btn.label}
            className={cn(
              'pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink shadow-md transition-colors',
              btn.danger ? 'hover:bg-coral hover:text-white' : 'hover:bg-violet hover:text-white',
            )}
          >
            <btn.icon className="h-4 w-4" />
          </motion.button>
        ))}
      </div>
    </Reorder.Item>
  )
}
