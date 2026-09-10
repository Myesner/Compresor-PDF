import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, FileUp, Files, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PdfEditor } from './usePdfEditor'

/**
 * Panel inline para importar páginas de otro PDF: selector de archivo,
 * rejilla de miniaturas seleccionables e inserción en el documento abierto.
 */
export default function ImportPanel({ editor, onClose }: { editor: PdfEditor; onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const depthRef = useRef(0)
  const { importState, importSelection } = editor
  const count = importSelection.size

  const pick = () => inputRef.current?.click()

  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="rounded-2xl border border-line bg-paper-deep p-4"
    >
      {/* Cabecera */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-soft text-violet-deep">
            <Files className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-ink">Añadir páginas de otro PDF</p>
            <p className="truncate text-[11px] text-ink-soft">
              {importState && !importState.loading
                ? `${importState.fileName} · ${importState.pages.length} ${importState.pages.length === 1 ? 'página' : 'páginas'}`
                : 'Elige un segundo PDF — todo ocurre en tu navegador.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar panel de importación"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-white hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Selector de archivo (siempre disponible: importar otro archivo reemplaza el actual) */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Arrastra otro PDF o haz clic para elegirlo"
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
          if (file) void editor.importPdfFile(file)
        }}
        className={cn(
          'mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-xs font-semibold transition-colors',
          dragOver
            ? 'border-violet bg-violet-soft text-violet-deep'
            : 'border-violet/40 text-violet-deep hover:bg-violet-soft',
        )}
      >
        {importState?.loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Leyendo PDF…
          </>
        ) : (
          <>
            <FileUp className="h-4 w-4" />
            {importState ? 'Importar otro archivo' : 'Arrastra un PDF o haz clic para elegirlo'}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void editor.importPdfFile(file)
            e.target.value = ''
          }}
        />
      </div>

      {/* Rejilla de miniaturas del PDF importado */}
      {importState && !importState.loading && importState.pages.length > 0 && (
        <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-line bg-white/60 p-3">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-7 xl:grid-cols-9">
            {importState.pages.map((page) => {
              const selected = page.src !== null && importSelection.has(page.src)
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => page.src !== null && editor.toggleImportPage(page.src)}
                  aria-pressed={selected}
                  aria-label={`Página importada ${(page.src ?? 0) + 1}`}
                  style={{ aspectRatio: `${page.w} / ${page.h}` }}
                  className={cn(
                    'group relative select-none overflow-hidden rounded-lg border bg-white shadow-card transition-shadow',
                    selected ? 'border-violet ring-[3px] ring-violet' : 'border-line hover:border-violet/50',
                  )}
                >
                  {page.src !== null && importState.thumbs[page.src] ? (
                    <img
                      src={importState.thumbs[page.src]}
                      alt=""
                      draggable={false}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-paper-deep">
                      <Loader2 className="h-4 w-4 animate-spin text-violet/60" />
                    </span>
                  )}
                  <span
                    className={cn(
                      'absolute bottom-1 left-1 rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold',
                      selected ? 'bg-violet text-white' : 'bg-ink/70 text-white',
                    )}
                  >
                    {(page.src ?? 0) + 1}
                  </span>
                  {selected && (
                    <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet text-white">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-center text-[11px] text-ink-soft">
            Haz clic en las miniaturas para seleccionarlas
          </p>
        </div>
      )}

      {/* Pie de acciones */}
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-white hover:text-ink"
        >
          <X className="h-3.5 w-3.5" />
          Cerrar
        </button>
        <motion.button
          type="button"
          onClick={editor.insertImportedPages}
          disabled={count === 0}
          whileHover={count === 0 ? undefined : { scale: 1.03 }}
          whileTap={count === 0 ? undefined : { scale: 0.97 }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-violet px-4 py-2 text-xs font-semibold text-white shadow-card transition-colors hover:bg-violet-deep disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FileUp className="h-3.5 w-3.5" />
          Insertar {count === 0 ? 'páginas' : `${count} ${count === 1 ? 'página' : 'páginas'}`}
        </motion.button>
      </div>
    </motion.section>
  )
}
