import { useState } from 'react'
import { AnimatePresence, Reorder, motion } from 'framer-motion'
import { FileOutput, Undo2, X } from 'lucide-react'
import PageThumb from './PageThumb'
import EditorToolbar from './EditorToolbar'
import ExportPanel from './ExportPanel'
import ImportPanel from './ImportPanel'
import type { PdfEditor } from './usePdfEditor'

export default function EditorWorkspace({ editor }: { editor: PdfEditor }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const { pages, thumbs, selection, range, importState } = editor

  // La miniatura de cada página sale de su documento origen.
  const thumbFor = (page: (typeof pages)[number]): string | null => {
    if (page.src === null) return null
    return page.doc === 1 ? (importState?.thumbs[page.src] ?? null) : (thumbs[page.src] ?? null)
  }

  const dimmedIds = new Set<string>()
  if (range.active) {
    const from = Math.max(1, Math.min(range.from, pages.length))
    const to = Math.max(from, Math.min(range.to, pages.length))
    pages.forEach((p, i) => {
      if (i + 1 < from || i + 1 > to) dimmedIds.add(p.id)
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <EditorToolbar
        fileName={editor.fileName}
        fileSize={editor.fileSize}
        pageCount={pages.length}
        selectedCount={selection.size}
        canUndo={editor.canUndo}
        onRotate={editor.rotateSelected}
        onDuplicate={editor.duplicateSelected}
        onDelete={editor.deleteSelected}
        onInsertBlank={editor.insertBlank}
        onAddFromPdf={() => setImportOpen((v) => !v)}
        onToggleSelectAll={editor.selectAll}
        onReset={editor.resetDocument}
        onUndo={editor.undo}
      />

      {/* Panel inline: añadir páginas de otro PDF */}
      <AnimatePresence>
        {importOpen && <ImportPanel editor={editor} onClose={() => setImportOpen(false)} />}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Rejilla de miniaturas */}
        <div>
          {pages.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-white/60 p-10 text-center">
              <p className="font-display text-lg font-bold text-ink">No queda ninguna página</p>
              <p className="text-sm text-ink-soft">Has eliminado todo el documento.</p>
              <button
                type="button"
                onClick={editor.undo}
                className="inline-flex items-center gap-2 rounded-xl border border-violet/40 px-4 py-2 text-xs font-semibold text-violet-deep transition-colors hover:bg-violet-soft"
              >
                <Undo2 className="h-4 w-4" />
                Deshacer
              </button>
            </div>
          ) : (
            <Reorder.Group
              as="div"
              values={pages}
              onReorder={editor.applyReorder}
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5"
            >
              <AnimatePresence initial={false}>
                {pages.map((page, i) => (
                  <PageThumb
                    key={page.id}
                    page={page}
                    position={i + 1}
                    thumb={thumbFor(page)}
                    selected={selection.has(page.id)}
                    dimmed={dimmedIds.has(page.id)}
                    onSelect={editor.handleSelect}
                    onRotate={editor.rotatePage}
                    onDuplicate={editor.duplicatePage}
                    onDelete={editor.deletePage}
                    onDragStart={editor.beginReorder}
                  />
                ))}
              </AnimatePresence>
            </Reorder.Group>
          )}
          <p className="mt-4 text-center text-xs text-ink-soft">
            Arrastra las páginas para reordenarlas · haz clic para seleccionar · Ctrl+clic para selección múltiple
          </p>
        </div>

        {/* Panel de exportación (desktop) */}
        <motion.aside
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="hidden lg:block"
        >
          <div className="sticky top-[4.5rem] rounded-2xl border border-line bg-white p-5 shadow-card">
            <ExportPanel editor={editor} />
          </div>
        </motion.aside>
      </div>

      {/* Botón fijo Exportar (móvil) */}
      <motion.button
        type="button"
        onClick={() => setSheetOpen(true)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-xl bg-violet px-5 py-3.5 text-sm font-semibold text-white shadow-lift lg:hidden"
      >
        <FileOutput className="h-4 w-4" />
        Exportar
      </motion.button>

      {/* Drawer inferior (móvil) */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-line bg-white p-6 shadow-lift lg:hidden"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-base font-bold text-ink">Exportar PDF</span>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Cerrar panel de exportación"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-soft transition-colors hover:bg-paper-deep"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <ExportPanel editor={editor} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
