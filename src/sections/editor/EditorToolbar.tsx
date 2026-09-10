import { motion, AnimatePresence } from 'framer-motion'
import { Copy, FilePlus2, Files, ListChecks, RotateCcw, RotateCw, Trash2, Undo2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/lib/pdf'

interface EditorToolbarProps {
  fileName: string
  fileSize: number
  pageCount: number
  selectedCount: number
  canUndo: boolean
  onRotate: () => void
  onDuplicate: () => void
  onDelete: () => void
  onInsertBlank: () => void
  onAddFromPdf: () => void
  onToggleSelectAll: () => void
  onReset: () => void
  onUndo: () => void
}

const spring = { type: 'spring', stiffness: 400, damping: 24 } as const

function ToolButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  danger,
  variant = 'default',
  title,
}: {
  icon: typeof RotateCw
  label: string
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  title?: string
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title ?? label}
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        variant === 'default' && 'bg-paper-deep text-ink hover:bg-violet-soft hover:text-violet-deep',
        variant === 'outline' && 'border border-violet/40 text-violet-deep hover:bg-violet-soft',
        variant === 'ghost' && 'text-ink-soft hover:bg-paper-deep hover:text-ink',
        danger && 'text-coral hover:bg-coral/10',
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  )
}

export default function EditorToolbar({
  fileName,
  fileSize,
  pageCount,
  selectedCount,
  canUndo,
  onRotate,
  onDuplicate,
  onDelete,
  onInsertBlank,
  onAddFromPdf,
  onToggleSelectAll,
  onReset,
  onUndo,
}: EditorToolbarProps) {
  const hasSelection = selectedCount > 0

  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="sticky top-[4.5rem] z-40 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-white/90 px-4 py-3 shadow-card backdrop-blur-md"
    >
      {/* Archivo */}
      <div className="min-w-0 flex-1 basis-40">
        <p className="truncate font-mono text-xs font-semibold text-ink">{fileName}</p>
        <p className="text-[11px] text-ink-soft">
          {pageCount} {pageCount === 1 ? 'página' : 'páginas'} · {formatBytes(fileSize)}
        </p>
      </div>

      {/* Acciones de selección */}
      <div className="flex items-center gap-1.5">
        <AnimatePresence>
          {hasSelection && (
            <motion.span
              key="count"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={spring}
              className="mr-1 rounded-full bg-violet px-2.5 py-1 font-mono text-[11px] font-semibold text-white"
            >
              {selectedCount}
            </motion.span>
          )}
        </AnimatePresence>
        <motion.div layout transition={spring} className="flex items-center gap-1.5">
          <ToolButton icon={RotateCw} label="Rotar" onClick={onRotate} disabled={!hasSelection} title="Rotar 90° (R)" />
          <ToolButton icon={Copy} label="Duplicar" onClick={onDuplicate} disabled={!hasSelection} />
          <ToolButton icon={Trash2} label="Eliminar" onClick={onDelete} disabled={!hasSelection} danger title="Eliminar (Supr)" />
        </motion.div>
      </div>

      {/* Acciones generales */}
      <div className="flex items-center gap-1.5">
        <ToolButton icon={FilePlus2} label="Página en blanco" onClick={onInsertBlank} variant="outline" />
        <ToolButton icon={Files} label="Añadir de otro PDF" onClick={onAddFromPdf} variant="outline" />
        <ToolButton icon={ListChecks} label="Sel. todo" onClick={onToggleSelectAll} variant="ghost" title="Seleccionar todo (Ctrl+A)" />
        <ToolButton icon={Undo2} label="Deshacer" onClick={onUndo} disabled={!canUndo} variant="ghost" title="Deshacer (Ctrl+Z)" />
        <ToolButton icon={RotateCcw} label="Restablecer" onClick={onReset} variant="ghost" />
      </div>
    </motion.div>
  )
}
