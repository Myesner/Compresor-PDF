import { motion, AnimatePresence } from 'framer-motion'
import { FileText, X } from 'lucide-react'
import { formatBytes } from '@/lib/pdf'
import type { PdfFileItem } from './types'

interface FileListProps {
  items: PdfFileItem[]
  onRemove: (id: string) => void
  disabled?: boolean
}

function FileCard({ item, onRemove, disabled }: { item: PdfFileItem; onRemove: () => void; disabled?: boolean }) {
  return (
    <>
      {/* Miniatura 56×72 con blur-in al renderizar */}
      <div className="flex h-[72px] w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-paper-deep">
        {item.thumb ? (
          <motion.img
            src={item.thumb}
            alt={`Portada de ${item.file.name}`}
            initial={{ filter: 'blur(8px)', opacity: 0.6 }}
            animate={{ filter: 'blur(0px)', opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <FileText className="h-6 w-6 text-violet/50" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-sm font-medium text-ink" title={item.file.name}>
          {item.file.name}
        </p>
        <p className="mt-0.5 font-mono text-[0.8125rem] text-ink-soft">{formatBytes(item.size)}</p>
      </div>

      <motion.button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        whileHover={{ rotate: 90 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-coral transition-colors hover:bg-coral/10 disabled:opacity-40"
        aria-label={`Quitar ${item.file.name}`}
      >
        <X className="h-5 w-5" />
      </motion.button>
    </>
  )
}

/** Lista vertical de archivos cargados con stagger de entrada y reflow. */
export default function FileList({ items, onRemove, disabled }: FileListProps) {
  return (
    <motion.ul layout className="mt-4 flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {items.map((item, i) => (
          <motion.li
            key={item.id}
            layout
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: i * 0.08 }}
            className="flex items-center gap-4 rounded-2xl border border-line bg-white p-3 shadow-card"
          >
            <FileCard item={item} onRemove={() => onRemove(item.id)} disabled={disabled} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}
