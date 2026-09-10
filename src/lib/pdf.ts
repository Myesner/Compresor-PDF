/**
 * Utilidades PDF compartidas (pdf-lib + pdf.js).
 *
 * - pdf-lib: manipulación estructural (reordenar, rotar, eliminar, extraer
 *   páginas, crear páginas en blanco, re-guardar comprimido).
 * - pdf.js (pdfjs-dist): renderizado de páginas a canvas para miniaturas.
 *
 * TODO el procesamiento ocurre en el navegador: ningún archivo sale del
 * dispositivo del usuario.
 */
import { PDFDocument } from 'pdf-lib'
import * as pdfjs from 'pdfjs-dist'

// El worker se sirve desde `public/pdf.worker.min.mjs` (copia verbatim de
// `node_modules/pdfjs-dist/build/pdf.worker.min.mjs`, ver
// `scripts/sync-pdf-worker.mjs`). NO importar la copia de node_modules con
// `?url`: en dev, Vite transforma el archivo y le inyecta `/@vite/client`,
// y el worker se cuelga al iniciar el HMR dentro del worker (getDocument
// nunca resuelve). Los archivos en `public/` se sirven sin transformación.
//
// pdfjs-dist está fijado en ^4.0.379 a propósito: desde ~4.1/v5 usa APIs
// ES2024 (`Promise.withResolvers`, etc.) que Brave DESACTIVA como medida
// antifingerprinting, rompiendo pdf.js por completo en ese navegador.
// Al actualizar pdfjs-dist: verificar que no use APIs ES2024 y `npm run sync:worker`.
pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`

export { PDFDocument, pdfjs }

/** Carga un documento con pdf-lib desde bytes / ArrayBuffer / Uint8Array. */
export async function loadPdfDocument(data: ArrayBuffer | Uint8Array): Promise<PDFDocument> {
  return PDFDocument.load(data, { ignoreEncryption: true })
}

/** Carga un documento con pdf.js (para renderizar miniaturas). */
export async function loadPdfJs(data: ArrayBuffer | Uint8Array) {
  const copy = data instanceof Uint8Array ? data.slice() : new Uint8Array(data.slice(0))
  return pdfjs.getDocument({ data: copy }).promise
}

export interface ThumbOptions {
  /** Índice de página (base 0). Por defecto la primera página. */
  pageIndex?: number
  /** Ancho máximo de la miniatura en px CSS. */
  maxWidth?: number
  /** Factor de escala para pantallas HiDPI. */
  deviceScale?: number
}

/**
 * Renderiza una página del PDF a una data-URL PNG para usar como miniatura.
 * Devuelve `null` si el índice de página no existe.
 */
export async function renderPageThumbnail(
  source: ArrayBuffer | Uint8Array,
  { pageIndex = 0, maxWidth = 220, deviceScale = 2 }: ThumbOptions = {},
): Promise<string | null> {
  const doc = await loadPdfJs(source)
  try {
    if (pageIndex < 0 || pageIndex >= doc.numPages) return null
    const page = await doc.getPage(pageIndex + 1)
    const base = page.getViewport({ scale: 1 })
    const scale = (maxWidth / base.width) * deviceScale
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    await page.render({ canvasContext: ctx, viewport }).promise
    return canvas.toDataURL('image/png')
  } finally {
    await doc.destroy()
  }
}

/** Formatea bytes a una cadena legible ("8.4 MB", "512 KB"). */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B'
  if (bytes < 1024) return `${Math.round(bytes)} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(decimals)} ${units[unit]}`
}

/** Guarda un PDFDocument y devuelve una Blob URL descargable. */
export async function savePdfAsBlobUrl(doc: PDFDocument): Promise<{ url: string; bytes: Uint8Array }> {
  const bytes = await doc.save({ useObjectStreams: true })
  const copy = new Uint8Array(bytes.length)
  copy.set(bytes)
  const blob = new Blob([copy.buffer], { type: 'application/pdf' })
  return { url: URL.createObjectURL(blob), bytes }
}

/* ────────────────────────────────────────────────────────────
 * Extensiones para el Editor de páginas (/editor)
 * ──────────────────────────────────────────────────────────── */

import { degrees, type PDFPage } from 'pdf-lib'

/** Tamaño A4 en puntos PDF (para páginas en blanco). */
export const A4_PORTRAIT: [number, number] = [595.28, 841.89]

/**
 * Renderiza una página de un documento pdf.js YA cargado a data-URL PNG.
 * Pensado para generar muchas miniaturas sin reabrir el documento.
 */
export async function renderThumbnailFromDoc(
  doc: pdfjs.PDFDocumentProxy,
  pageIndex: number,
  maxWidth = 240,
  deviceScale = 2,
): Promise<string | null> {
  if (pageIndex < 0 || pageIndex >= doc.numPages) return null
  const page = await doc.getPage(pageIndex + 1)
  const base = page.getViewport({ scale: 1 })
  const scale = (maxWidth / base.width) * deviceScale
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(viewport.width)
  canvas.height = Math.ceil(viewport.height)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  await page.render({ canvasContext: ctx, viewport }).promise
  return canvas.toDataURL('image/png')
}

/** Devuelve el tamaño (puntos) de una página de un doc pdf.js ya cargado. */
export async function getPageSize(
  doc: pdfjs.PDFDocumentProxy,
  pageIndex: number,
): Promise<{ width: number; height: number }> {
  const page = await doc.getPage(pageIndex + 1)
  const viewport = page.getViewport({ scale: 1 })
  return { width: viewport.width, height: viewport.height }
}

/** Operación de página para construir el PDF exportado. */
export interface PageOperation {
  /** Documento origen: 0 = principal (por defecto), 1 = PDF importado. */
  doc?: number
  /** Índice (base 0) de la página en el documento origen, o null = página en blanco. */
  sourceIndex: number | null
  /** Rotación adicional en grados (0, 90, 180, 270). */
  rotate: number
}

/**
 * Construye un PDFDocument nuevo aplicando una lista de operaciones:
 * copia páginas del documento principal (`main`) o del documento importado
 * (`extra`, referenciado con `doc: 1`), respetando orden, duplicados y
 * rotaciones, e inserta páginas en blanco (A4) donde `sourceIndex` sea null.
 *
 * Cada documento origen se carga una sola vez y las copias se agrupan por
 * documento (pdf-lib admite índices repetidos dentro de un mismo copyPages).
 *
 * Lanza un Error si alguna operación referencia el documento 1 (`doc: 1`)
 * pero `extra` no se proporciona o es null.
 */
export async function buildEditedPdf(
  main: ArrayBuffer | Uint8Array,
  ops: PageOperation[],
  extra?: ArrayBuffer | Uint8Array | null,
): Promise<PDFDocument> {
  const usesExtra = ops.some((o) => (o.doc ?? 0) === 1)
  if (usesExtra && !extra) {
    throw new Error('buildEditedPdf: hay páginas del documento importado (doc: 1) pero no se proporcionó el PDF extra.')
  }
  const [mainDoc, extraDoc] = await Promise.all([
    loadPdfDocument(main),
    extra ? loadPdfDocument(extra) : Promise.resolve(null),
  ])
  const out = await PDFDocument.create()

  // Copiar todas las páginas necesarias de cada origen (índices repetidos admitidos).
  const srcDocs: (PDFDocument | null)[] = [mainDoc, extraDoc]
  const copiedByDoc: PDFPage[][] = [[], []]
  for (let d = 0; d <= 1; d++) {
    const indices = ops
      .filter((o) => o.sourceIndex !== null && (o.doc ?? 0) === d)
      .map((o) => o.sourceIndex as number)
    if (indices.length === 0) continue
    const srcDoc = srcDocs[d]
    if (!srcDoc) {
      throw new Error(`buildEditedPdf: falta el documento origen ${d}.`)
    }
    copiedByDoc[d] = await out.copyPages(srcDoc, indices)
  }

  // Cursor de páginas copiadas por documento, para ensamblar en orden.
  const cursors = [0, 0]
  for (const op of ops) {
    if (op.sourceIndex === null) {
      const rot = ((op.rotate % 360) + 360) % 360
      const landscape = rot === 90 || rot === 270
      const [w, h] = A4_PORTRAIT
      const page = out.addPage(landscape ? [h, w] : [w, h])
      if (rot > 0) page.setRotation(degrees(rot))
    } else {
      const d = op.doc ?? 0
      const page = copiedByDoc[d][cursors[d]++]
      const current = page.getRotation().angle
      const next = (((current + op.rotate) % 360) + 360) % 360
      if (next !== current) page.setRotation(degrees(next))
      out.addPage(page)
    }
  }
  return out
}
