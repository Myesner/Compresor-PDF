import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import {
  loadPdfJs,
  buildEditedPdf,
  savePdfAsBlobUrl,
  renderThumbnailFromDoc,
  getPageSize,
  formatBytes,
} from '@/lib/pdf'

/* ── Tipos ─────────────────────────────────────────────────── */

export interface EditorPage {
  id: string
  /**
   * Documento origen: 0 = documento principal (por defecto, se omite),
   * 1 = PDF importado con «Añadir de otro PDF».
   */
  doc?: number
  /** Índice base 0 en el PDF origen; null = página en blanco. */
  src: number | null
  /** Rotación adicional (0 | 90 | 180 | 270). */
  rot: number
  /** Tamaño original en puntos (para el aspect-ratio de la miniatura). */
  w: number
  h: number
}

/** Estado del PDF importado para insertar páginas en el documento principal. */
export interface ImportState {
  fileName: string
  pages: EditorPage[]
  thumbs: Record<number, string>
  loading: boolean
}

export type LoadError = 'protected' | 'corrupt' | 'not-pdf' | null

export interface ExportResult {
  url: string
  bytes: number
  pages: number
  name: string
}

interface RangeState {
  from: number
  to: number
  active: boolean
}

const A4 = { w: 595.28, h: 841.89 }
const HISTORY_LIMIT = 60

function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `p-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/* ── Hook ──────────────────────────────────────────────────── */

export function usePdfEditor() {
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [pages, setPages] = useState<EditorPage[]>([])
  const [originalPages, setOriginalPages] = useState<EditorPage[]>([])
  const [thumbs, setThumbs] = useState<Record<number, string>>({})
  const [selection, setSelection] = useState<ReadonlySet<string>>(new Set())
  const [range, setRange] = useState<RangeState>({ from: 1, to: 1, active: false })
  const [outputName, setOutputName] = useState('editado.pdf')
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState<ExportResult | null>(null)
  const [error, setError] = useState<LoadError>(null)
  const [undoCount, setUndoCount] = useState(0)
  const [importState, setImportState] = useState<ImportState | null>(null)
  const [importSelection, setImportSelection] = useState<ReadonlySet<number>>(new Set())

  const bytesRef = useRef<Uint8Array | null>(null)
  const extraBytesRef = useRef<Uint8Array | null>(null)
  const docRef = useRef<PDFDocumentProxy | null>(null)
  const extraDocRef = useRef<PDFDocumentProxy | null>(null)
  const pagesRef = useRef<EditorPage[]>([])
  const historyRef = useRef<EditorPage[][]>([])
  const lastClickedRef = useRef<string | null>(null)
  const renderGenRef = useRef(0)
  const importGenRef = useRef(0)

  pagesRef.current = pages

  /* ── Historial (deshacer) ────────────────────────────────── */

  const pushHistory = useCallback(() => {
    historyRef.current.push(pagesRef.current)
    if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift()
    setUndoCount(historyRef.current.length)
  }, [])

  const undo = useCallback(() => {
    const prev = historyRef.current.pop()
    setUndoCount(historyRef.current.length)
    if (!prev) return
    const valid = new Set(prev.map((p) => p.id))
    setSelection((sel) => new Set([...sel].filter((id) => valid.has(id))))
    setPages(prev)
  }, [])

  const mutate = useCallback(
    (fn: (prev: EditorPage[]) => EditorPage[]) => {
      pushHistory()
      setPages((prev) => fn(prev))
    },
    [pushHistory],
  )

  /* ── Carga de archivo ────────────────────────────────────── */

  const teardown = useCallback(async () => {
    renderGenRef.current += 1
    importGenRef.current += 1
    if (docRef.current) {
      try {
        await docRef.current.destroy()
      } catch {
        /* noop */
      }
      docRef.current = null
    }
    if (extraDocRef.current) {
      try {
        await extraDocRef.current.destroy()
      } catch {
        /* noop */
      }
      extraDocRef.current = null
    }
    bytesRef.current = null
    extraBytesRef.current = null
    historyRef.current = []
    setUndoCount(0)
    setPages([])
    setOriginalPages([])
    setThumbs({})
    setSelection(new Set())
    setImportState(null)
    setImportSelection(new Set())
    setResult(null)
    setRange({ from: 1, to: 1, active: false })
    lastClickedRef.current = null
  }, [])

  useEffect(() => {
    return () => {
      renderGenRef.current += 1
      importGenRef.current += 1
      docRef.current?.destroy().catch(() => undefined)
      extraDocRef.current?.destroy().catch(() => undefined)
    }
  }, [])

  const loadFile = useCallback(
    async (file: File) => {
      const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
      if (!isPdf) {
        setError('not-pdf')
        toast.error('Eso no parece un PDF', {
          description: 'El editor solo acepta archivos .pdf. Prueba con otro archivo.',
        })
        return
      }
      await teardown()
      setLoading(true)
      setError(null)
      setResult(null)
      try {
        const buffer = await file.arrayBuffer()
        const bytes = new Uint8Array(buffer)
        let doc: PDFDocumentProxy
        try {
          doc = await loadPdfJs(bytes)
        } catch (e) {
          const name = (e as { name?: string })?.name ?? ''
          if (name === 'PasswordException') {
            setError('protected')
            toast.error('PDF protegido con contraseña', {
              description: 'La edición de PDFs protegidos no está soportada todavía.',
            })
          } else {
            setError('corrupt')
            toast.error('No pudimos leer este archivo', {
              description: 'El PDF parece dañado o tiene un formato no soportado.',
            })
          }
          return
        }

        docRef.current = doc
        bytesRef.current = bytes
        const gen = renderGenRef.current

        const initial: EditorPage[] = []
        for (let i = 0; i < doc.numPages; i++) {
          const { width, height } = await getPageSize(doc, i)
          if (renderGenRef.current !== gen) return
          initial.push({ id: uid(), src: i, rot: 0, w: width, h: height })
        }

        const base = file.name.replace(/\.pdf$/i, '')
        setFileName(file.name)
        setFileSize(file.size)
        setPages(initial)
        setOriginalPages(initial)
        setOutputName(`${base}-editado.pdf`)
        setRange({ from: 1, to: initial.length, active: false })
        setLoading(false)
        toast.success(`«${file.name}» cargado`, {
          description: `${initial.length} páginas · ${formatBytes(file.size)} — todo en tu navegador.`,
        })

        // Render de miniaturas en segundo plano (concurrencia 2)
        const queue = Array.from({ length: doc.numPages }, (_, i) => i)
        const worker = async () => {
          while (queue.length > 0) {
            if (renderGenRef.current !== gen) return
            const idx = queue.shift()
            if (idx === undefined) return
            try {
              const dataUrl = await renderThumbnailFromDoc(doc, idx, 260, 2)
              if (renderGenRef.current !== gen || !dataUrl) continue
              setThumbs((t) => (t[idx] ? t : { ...t, [idx]: dataUrl }))
            } catch {
              /* miniatura fallida: se muestra placeholder */
            }
          }
        }
        void Promise.all([worker(), worker()])
      } catch {
        setError('corrupt')
        toast.error('No pudimos leer este archivo', {
          description: 'El PDF parece dañado o tiene un formato no soportado.',
        })
      } finally {
        setLoading(false)
      }
    },
    [teardown],
  )

  /* ── Importar páginas de otro PDF ────────────────────────── */

  const importPdfFile = useCallback(async (file: File) => {
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
    if (!isPdf) {
      toast.error('Eso no parece un PDF', {
        description: 'Solo puedes importar páginas de archivos .pdf. Prueba con otro archivo.',
      })
      return
    }
    // Invariante: si hay páginas importadas (doc 1) en el documento, sus
    // referencias `src` apuntan al archivo actualmente importado. Reemplazar
    // el import ahora haría que exportaran contenido del archivo nuevo (y
    // que las miniaturas muestren el PDF equivocado) sin ningún aviso.
    if (pagesRef.current.some((p) => p.doc === 1)) {
      toast.error('Ya hay páginas de otro PDF en el documento', {
        description: 'Elimínalas antes de importar un archivo distinto.',
      })
      return
    }
    // Invalida renders en vuelo del import anterior y destruye su documento.
    importGenRef.current += 1
    const gen = importGenRef.current
    if (extraDocRef.current) {
      extraDocRef.current.destroy().catch(() => undefined)
      extraDocRef.current = null
    }
    extraBytesRef.current = null
    setImportSelection(new Set())
    setImportState({ fileName: file.name, pages: [], thumbs: {}, loading: true })
    try {
      const buffer = await file.arrayBuffer()
      if (importGenRef.current !== gen) return
      const bytes = new Uint8Array(buffer)
      let doc: PDFDocumentProxy
      try {
        doc = await loadPdfJs(bytes)
      } catch (e) {
        const name = (e as { name?: string })?.name ?? ''
        if (name === 'PasswordException') {
          toast.error('PDF protegido con contraseña', {
            description: 'No se pueden importar páginas de PDFs protegidos todavía.',
          })
        } else {
          toast.error('No pudimos leer este archivo', {
            description: 'El PDF parece dañado o tiene un formato no soportado.',
          })
        }
        setImportState(null)
        return
      }
      if (importGenRef.current !== gen) {
        void doc.destroy().catch(() => undefined)
        return
      }

      extraDocRef.current = doc
      extraBytesRef.current = bytes

      const imported: EditorPage[] = []
      for (let i = 0; i < doc.numPages; i++) {
        const { width, height } = await getPageSize(doc, i)
        if (importGenRef.current !== gen) return
        imported.push({ id: uid(), doc: 1, src: i, rot: 0, w: width, h: height })
      }

      setImportState({ fileName: file.name, pages: imported, thumbs: {}, loading: false })
      toast.success(`«${file.name}» importado`, {
        description: `${imported.length} páginas listas para insertar — sin salir de tu navegador.`,
      })

      // Render de miniaturas en segundo plano (concurrencia 2)
      const queue = Array.from({ length: doc.numPages }, (_, i) => i)
      const worker = async () => {
        while (queue.length > 0) {
          if (importGenRef.current !== gen) return
          const idx = queue.shift()
          if (idx === undefined) return
          try {
            const dataUrl = await renderThumbnailFromDoc(doc, idx, 260, 2)
            if (importGenRef.current !== gen || !dataUrl) continue
            setImportState((s) => (s && !s.thumbs[idx] ? { ...s, thumbs: { ...s.thumbs, [idx]: dataUrl } } : s))
          } catch {
            /* miniatura fallida: se muestra placeholder */
          }
        }
      }
      void Promise.all([worker(), worker()])
    } catch {
      setImportState(null)
      toast.error('No pudimos leer este archivo', {
        description: 'El PDF parece dañado o tiene un formato no soportado.',
      })
    }
  }, [])

  const toggleImportPage = useCallback((src: number) => {
    setImportSelection((prev) => {
      const next = new Set(prev)
      if (next.has(src)) next.delete(src)
      else next.add(src)
      return next
    })
  }, [])

  const clearImportSelection = useCallback(() => setImportSelection(new Set()), [])

  const insertImportedPages = useCallback(() => {
    const imp = importState
    if (!imp || imp.loading || importSelection.size === 0) return
    // Se insertan en el orden natural del archivo importado, no en el de clic.
    const picked = imp.pages.filter((p) => p.src !== null && importSelection.has(p.src))
    if (picked.length === 0) return
    mutate((prev) => {
      let insertAt = prev.length
      for (let i = prev.length - 1; i >= 0; i--) {
        // Solo páginas del documento principal anclan la posición: una
        // página importada seleccionada no debería delimitar el hueco.
        if (prev[i].doc !== 1 && selection.has(prev[i].id)) {
          insertAt = i + 1
          break
        }
      }
      // Ids nuevos: la misma página importada puede insertarse varias veces.
      const fresh = picked.map((p) => ({ ...p, id: uid() }))
      return [...prev.slice(0, insertAt), ...fresh, ...prev.slice(insertAt)]
    })
    setImportSelection(new Set())
    toast.success(picked.length === 1 ? 'Página insertada' : `${picked.length} páginas insertadas`, {
      description: 'Usa Deshacer (Ctrl+Z) si no era lo que querías.',
    })
  }, [importState, importSelection, selection, mutate])

  /* ── Selección ───────────────────────────────────────────── */

  const handleSelect = useCallback((id: string, opts: { ctrl: boolean; shift: boolean }) => {
    const list = pagesRef.current
    setSelection((prev) => {
      const next = new Set(prev)
      if (opts.shift && lastClickedRef.current) {
        const a = list.findIndex((p) => p.id === lastClickedRef.current)
        const b = list.findIndex((p) => p.id === id)
        if (a !== -1 && b !== -1) {
          const [lo, hi] = a < b ? [a, b] : [b, a]
          for (let i = lo; i <= hi; i++) next.add(list[i].id)
          return next
        }
      }
      if (opts.ctrl) {
        if (next.has(id)) next.delete(id)
        else next.add(id)
      } else {
        next.clear()
        next.add(id)
      }
      return next
    })
    lastClickedRef.current = id
  }, [])

  const selectAll = useCallback(() => {
    setSelection((prev) =>
      prev.size === pagesRef.current.length ? new Set() : new Set(pagesRef.current.map((p) => p.id)),
    )
  }, [])

  const clearSelection = useCallback(() => setSelection(new Set()), [])

  /* ── Operaciones sobre páginas ───────────────────────────── */

  const rotateSelected = useCallback(() => {
    const sel = selection
    if (sel.size === 0) return
    mutate((prev) => prev.map((p) => (sel.has(p.id) ? { ...p, rot: (p.rot + 90) % 360 } : p)))
  }, [selection, mutate])

  const duplicateSelected = useCallback(() => {
    const sel = selection
    if (sel.size === 0) return
    const newIds: string[] = []
    mutate((prev) => {
      const next: EditorPage[] = []
      for (const p of prev) {
        next.push(p)
        if (sel.has(p.id)) {
          const copy = { ...p, id: uid() }
          newIds.push(copy.id)
          next.push(copy)
        }
      }
      return next
    })
    setSelection(new Set(newIds))
  }, [selection, mutate])

  const deleteSelected = useCallback(() => {
    const sel = selection
    if (sel.size === 0) return
    const count = sel.size
    mutate((prev) => prev.filter((p) => !sel.has(p.id)))
    setSelection(new Set())
    toast.success(count === 1 ? 'Página eliminada' : `${count} páginas eliminadas`, {
      description: 'Tu PDF original no se ha tocado.',
      duration: 5000,
      action: { label: 'Deshacer', onClick: () => undo() },
    })
  }, [selection, mutate, undo])

  const deletePage = useCallback(
    (id: string) => {
      mutate((prev) => prev.filter((p) => p.id !== id))
      setSelection((sel) => {
        if (!sel.has(id)) return sel
        const next = new Set(sel)
        next.delete(id)
        return next
      })
      toast.success('Página eliminada', {
        duration: 5000,
        action: { label: 'Deshacer', onClick: () => undo() },
      })
    },
    [mutate, undo],
  )

  const rotatePage = useCallback(
    (id: string) => {
      mutate((prev) => prev.map((p) => (p.id === id ? { ...p, rot: (p.rot + 90) % 360 } : p)))
    },
    [mutate],
  )

  const duplicatePage = useCallback(
    (id: string) => {
      mutate((prev) => {
        const idx = prev.findIndex((p) => p.id === id)
        if (idx === -1) return prev
        const copy = { ...prev[idx], id: uid() }
        return [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]
      })
    },
    [mutate],
  )

  const insertBlank = useCallback(() => {
    const sel = selection
    const blank: EditorPage = { id: uid(), src: null, rot: 0, w: A4.w, h: A4.h }
    mutate((prev) => {
      let insertAt = prev.length
      if (sel.size > 0) {
        for (let i = prev.length - 1; i >= 0; i--) {
          if (sel.has(prev[i].id)) {
            insertAt = i + 1
            break
          }
        }
      }
      return [...prev.slice(0, insertAt), blank, ...prev.slice(insertAt)]
    })
    setSelection(new Set([blank.id]))
    toast.success('Página en blanco añadida', {
      description: 'Tamaño A4. Arrástrala para colocarla donde quieras.',
    })
  }, [selection, mutate])

  const beginReorder = useCallback(() => pushHistory(), [pushHistory])

  const applyReorder = useCallback((next: EditorPage[]) => setPages(next), [])

  const resetDocument = useCallback(() => {
    const ok = window.confirm(
      '¿Restablecer el documento?\n\nVolverás al orden y orientación originales. Los cambios se perderán (el archivo original nunca se modifica).',
    )
    if (!ok) return
    pushHistory()
    setPages(originalPages.map((p) => ({ ...p })))
    setSelection(new Set())
    setRange({ from: 1, to: originalPages.length, active: false })
    toast.success('Documento restablecido')
  }, [originalPages, pushHistory])

  /* ── Exportación ─────────────────────────────────────────── */

  const effectivePages = useCallback((): EditorPage[] => {
    const list = pagesRef.current
    if (!range.active) return list
    const from = Math.max(1, Math.min(range.from, list.length))
    const to = Math.max(from, Math.min(range.to, list.length))
    return list.slice(from - 1, to)
  }, [range])

  const exportPdf = useCallback(async () => {
    const bytes = bytesRef.current
    if (!bytes || exporting) return
    const list = effectivePages()
    if (list.length === 0) {
      toast.error('No hay páginas que exportar', {
        description: 'El documento está vacío o el rango no contiene páginas.',
      })
      return
    }
    setExporting(true)
    try {
      const ops = list.map((p) => ({ doc: p.doc ?? 0, sourceIndex: p.src, rotate: p.rot }))
      const doc = await buildEditedPdf(bytes, ops, extraBytesRef.current)
      const { url, bytes: outBytes } = await savePdfAsBlobUrl(doc)
      setResult({ url, bytes: outBytes.length, pages: list.length, name: outputName || 'editado.pdf' })
      toast.success('PDF exportado', {
        description: `${list.length} páginas · ${formatBytes(outBytes.length)}. Listo para descargar.`,
      })
    } catch (err) {
      toast.error('No pudimos exportar el PDF', {
        description:
          err instanceof Error && err.message
            ? err.message
            : 'Ha ocurrido un error inesperado al construir el documento.',
      })
    } finally {
      setExporting(false)
    }
  }, [exporting, effectivePages, outputName])

  const continueEditing = useCallback(() => {
    setResult((r) => {
      if (r) URL.revokeObjectURL(r.url)
      return null
    })
  }, [])

  const editAnother = useCallback(async () => {
    setResult((r) => {
      if (r) URL.revokeObjectURL(r.url)
      return null
    })
    setFileName('')
    setFileSize(0)
    setError(null)
    await teardown()
  }, [teardown])

  /* ── Resumen de cambios ──────────────────────────────────── */

  const changes = (() => {
    const total = pages.length
    const rotated = pages.filter((p) => p.rot !== 0).length
    const blanks = pages.filter((p) => p.src === null).length
    // Solo páginas del documento principal: los índices src de las importadas
    // no son comparables con originalPages y romperían el cálculo.
    const keptSrc = pages.filter((p) => p.src !== null && p.doc !== 1).map((p) => p.src as number)
    const unique = new Set(keptSrc)
    const deleted = originalPages.length - unique.size
    const duplicated = keptSrc.length - unique.size
    // Reordenado: el orden de primera aparición difiere del orden original ascendente
    const firstSeen = [...unique]
    const sorted = [...firstSeen].sort((a, b) => a - b)
    const isReordered = firstSeen.some((v, i) => v !== sorted[i])
    return { total, rotated, blanks, deleted, duplicated, reordered: isReordered }
  })()

  return {
    // estado
    fileName,
    fileSize,
    loaded: pages.length > 0 || originalPages.length > 0,
    pages,
    thumbs,
    selection,
    range,
    outputName,
    loading,
    exporting,
    result,
    error,
    canUndo: undoCount > 0,
    changes,
    importState,
    importSelection,
    // acciones
    loadFile,
    importPdfFile,
    toggleImportPage,
    clearImportSelection,
    insertImportedPages,
    handleSelect,
    selectAll,
    clearSelection,
    rotateSelected,
    duplicateSelected,
    deleteSelected,
    deletePage,
    rotatePage,
    duplicatePage,
    insertBlank,
    beginReorder,
    applyReorder,
    resetDocument,
    undo,
    setRange,
    setOutputName,
    exportPdf,
    continueEditing,
    editAnother,
  }
}

export type PdfEditor = ReturnType<typeof usePdfEditor>
