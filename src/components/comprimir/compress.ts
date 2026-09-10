/**
 * Motor de compresión de PDF 100% en el navegador (pdf-lib + canvas).
 *
 * Técnicas aplicadas según nivel:
 * - Todos: re-guardado con `useObjectStreams: true` (objetos comprimidos),
 *   eliminación de miniaturas embebidas (`/Thumb`).
 * - Toggle: eliminación de metadatos (Info + XMP) y anotaciones (`/Annots`).
 * - Recomendada/Extrema: re-compresión de imágenes JPEG embebidas con
 *   OBJETIVO de reducción (target): cada imagen se re-codifica vía canvas
 *   bajando calidad/dimensiones por escalones hasta entrar en el presupuesto
 *   de bytes que permite cumplir el objetivo global. El porcentaje final
 *   depende del contenido; el motor busca el objetivo sin empeorar nunca
 *   una imagen respecto a su original. Se aceptan JPEG con ColorSpace
 *   `/ICCBased` cuando el perfil tiene 1 o 3 componentes (Gray/RGB): el
 *   navegador aplica el perfil al decodificar y la salida es sRGB plano.
 *
 * Fallback: si una imagen no se puede re-codificar (CMYK, error de decode…)
 * se conserva la original. Si el resultado global no es menor que el
 * original, se devuelve el mejor intento obtenido (nunca un archivo mayor).
 */
import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFRef,
} from 'pdf-lib'

export type CompressionLevel = 'ligera' | 'recomendada' | 'extrema'

export interface CompressOptions {
  level: CompressionLevel
  /** Eliminar metadatos (Info/XMP) y anotaciones. */
  stripMetadata: boolean
}

export type CompressStage =
  | 'analizando'
  | 'imagenes'
  | 'reconstruyendo'
  | 'listo'

export interface CompressProgress {
  stage: CompressStage
  /** 0 → 1 */
  progress: number
}

export interface CompressResult {
  bytes: Uint8Array
  originalSize: number
  compressedSize: number
  /** true si no se logró reducir nada (se devuelve el original). */
  noGain: boolean
  imagesProcessed: number
}

/** Un escalón de re-codificación: calidad JPEG y dimensión máxima en px. */
interface Rung {
  quality: number
  maxDim: number
}

/**
 * Configuración por nivel: escalón de inicio, escalón mínimo (piso) y
 * objetivo de reducción global (0–1; 0.8 = buscar archivo 80% más ligero).
 * `ligera` no re-comprime imágenes (solo re-guarda estructura).
 */
interface LevelConfig {
  start: Rung
  floor: Rung
  target: number
}

const LEVEL_CONFIG: Record<CompressionLevel, LevelConfig | null> = {
  ligera: null,
  recomendada: {
    start: { quality: 0.72, maxDim: 2200 },
    floor: { quality: 0.2, maxDim: 850 },
    target: 0.8,
  },
  extrema: {
    start: { quality: 0.5, maxDim: 1500 },
    floor: { quality: 0.15, maxDim: 700 },
    target: 0.9,
  },
}

/**
 * Escalones de calidad decrecientes desde `start` hasta `floor`. En cada
 * paso se baja ~20% la calidad y ~22% la dimensión máxima, de modo que la
 * foto grande y la pequeña recorren la misma escalera de agresividad.
 */
function buildLadder(start: Rung, floor: Rung): Rung[] {
  const rungs: Rung[] = []
  let q = start.quality
  let d = start.maxDim
  for (let guard = 0; guard < 12; guard += 1) {
    rungs.push({ quality: q, maxDim: d })
    const nq = q * 0.8
    const nd = d * 0.78
    if (nq <= floor.quality && nd <= floor.maxDim) break
    q = Math.max(floor.quality, nq)
    d = Math.max(floor.maxDim, nd)
    if (q === floor.quality && d === floor.maxDim) break
  }
  const last = rungs[rungs.length - 1]
  if (last.quality > floor.quality || last.maxDim > floor.maxDim) {
    rungs.push(floor)
  }
  return rungs
}

/** Nº de componentes de un perfil ICC (1=Gray, 3=RGB, 4=CMYK). */
function iccComponentCount(doc: PDFDocument, cs: unknown): number | null {
  if (!(cs instanceof PDFArray)) return null
  if (cs.get(0) !== PDFName.of('ICCBased')) return null
  const entry = cs.get(1)
  const profile = entry instanceof PDFRef ? doc.context.lookup(entry) : entry
  if (!(profile instanceof PDFRawStream)) return null
  const n = profile.dict.get(PDFName.of('N'))
  return n instanceof PDFNumber ? n.asNumber() : null
}

/**
 * ¿Es un stream de imagen JPEG (DCTDecode) que el navegador puede decodificar
 * con colores correctos? Acepta RGB/Gray directos y perfiles ICCBased de 1 o
 * 3 componentes. CMYK (N=4) queda excluido: los canvas no lo respetan.
 */
function isRecompressibleJpeg(doc: PDFDocument, stream: PDFRawStream): boolean {
  const dict = stream.dict
  const subtype = dict.get(PDFName.of('Subtype'))
  if (subtype !== PDFName.of('Image')) return false
  const filter = dict.lookup(PDFName.of('Filter'))
  const filters = filter instanceof PDFArray ? filter.asArray() : [filter]
  if (filters.length !== 1 || filters[0] !== PDFName.of('DCTDecode')) return false
  const cs = dict.lookup(PDFName.of('ColorSpace'))
  if (cs === PDFName.of('DeviceRGB') || cs === PDFName.of('DeviceGray')) return true
  const n = iccComponentCount(doc, cs)
  return n === 1 || n === 3
}

/** Decodifica un JPEG a ImageBitmap; devuelve null si el navegador no puede. */
async function decodeJpeg(bytes: Uint8Array): Promise<ImageBitmap | null> {
  try {
    const copy = new Uint8Array(bytes.length)
    copy.set(bytes)
    const blob = new Blob([copy.buffer], { type: 'image/jpeg' })
    return await createImageBitmap(blob)
  } catch {
    return null
  }
}

/** Re-codifica un bitmap a JPEG con calidad y tamaño máximo dados. */
async function encodeJpeg(
  bitmap: ImageBitmap,
  quality: number,
  maxDim: number,
): Promise<{ bytes: Uint8Array; width: number; height: number } | null> {
  try {
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    // Fondo blanco por si el JPEG tuviera canal alfa implícito.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(bitmap, 0, 0, width, height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality),
    )
    if (!blob) return null
    const buf = await blob.arrayBuffer()
    return { bytes: new Uint8Array(buf), width, height }
  } catch {
    return null
  }
}

/**
 * Re-comprime las imágenes JPEG embebidas buscando el objetivo global de
 * reducción (`cfg.target`). Reparte el presupuesto de bytes de forma equitativa
 * entre imágenes y cada una baja por la escalera de calidad hasta entrar en
 * su presupuesto; si ningún escalón lo logra, usa el más ligero obtenido
 * (siempre que mejore al original). Devuelve cuántas se procesaron.
 */
async function recompressEmbeddedImages(
  doc: PDFDocument,
  originalSize: number,
  cfg: LevelConfig,
  onProgress: (done: number, total: number) => void,
): Promise<number> {
  const targets: { stream: PDFRawStream; original: Uint8Array }[] = []
  for (const [, obj] of doc.context.enumerateIndirectObjects() as [PDFRef, unknown][]) {
    if (obj instanceof PDFRawStream && isRecompressibleJpeg(doc, obj)) {
      targets.push({ stream: obj, original: obj.getContents() })
    }
  }
  const total = targets.length
  if (total === 0) {
    onProgress(0, 0)
    return 0
  }

  // Presupuesto de bytes por imagen para cumplir el objetivo global:
  // total_objetivo = (1 - target) · tamaño_original; de ahí se descuenta
  // la parte no compresible (texto, fuentes, estructura) y se reparte.
  const imagesBytes = targets.reduce((acc, t) => acc + t.original.length, 0)
  const fixedBytes = Math.max(0, originalSize - imagesBytes)
  const budget = Math.max(
    0,
    Math.floor(((1 - cfg.target) * originalSize - fixedBytes) / total),
  )

  const ladder = buildLadder(cfg.start, cfg.floor)
  let processed = 0
  let done = 0
  for (const target of targets) {
    const bitmap = await decodeJpeg(target.original)
    if (bitmap) {
      let chosen: { bytes: Uint8Array; width: number; height: number } | null = null
      let smallest: { bytes: Uint8Array; width: number; height: number } | null = null
      for (const rung of ladder) {
        const enc = await encodeJpeg(bitmap, rung.quality, rung.maxDim)
        if (!enc) continue
        if (enc.bytes.length < target.original.length) {
          if (!smallest || enc.bytes.length < smallest.bytes.length) smallest = enc
          if (enc.bytes.length <= budget) {
            chosen = enc
            break
          }
        }
      }
      bitmap.close()
      // Preferimos el escalón que cumple el presupuesto; si ninguno, el más
      // ligero (nunca sustituimos por algo mayor que el original).
      const final = chosen ?? smallest
      if (final) {
        const mutable = target.stream as unknown as { contents: Uint8Array }
        mutable.contents = final.bytes
        // Length se recalcula solo en updateDict() al guardar; las
        // dimensiones sí hay que actualizarlas si hubo reescalado.
        target.stream.dict.set(PDFName.of('Width'), PDFNumber.of(final.width))
        target.stream.dict.set(PDFName.of('Height'), PDFNumber.of(final.height))
        // El JPEG nuevo sale del canvas sin perfil ICC embebido: lo
        // declaramos como DeviceRGB para que ningún viewer aplique el
        // perfil antiguo (que ya no corresponde) sobre datos sRGB.
        target.stream.dict.set(PDFName.of('ColorSpace'), PDFName.of('DeviceRGB'))
        processed += 1
      }
    }
    done += 1
    onProgress(done, total)
    // Cedemos el hilo para que la UI (anillo de progreso) respire.
    await new Promise((r) => setTimeout(r, 0))
  }
  return processed
}

/** Elimina metadatos (Info dict + stream XMP) y anotaciones del documento. */
function stripMetadataAndAnnots(doc: PDFDocument): void {
  try {
    const infoRef = doc.context.trailerInfo.Info
    const info = infoRef ? doc.context.lookup(infoRef) : undefined
    if (info instanceof PDFDict) {
      for (const key of [
        'Title',
        'Author',
        'Subject',
        'Keywords',
        'Creator',
        'Producer',
        'CreationDate',
        'ModDate',
        'Trapped',
      ]) {
        info.delete(PDFName.of(key))
      }
    }
    doc.catalog.delete(PDFName.of('Metadata'))
  } catch {
    /* no crítico */
  }
  for (const page of doc.getPages()) {
    page.node.delete(PDFName.of('Annots'))
  }
}

/** Elimina miniaturas embebidas de página (/Thumb) — peso muerto en pantalla. */
function removePageThumbnails(doc: PDFDocument): void {
  for (const page of doc.getPages()) {
    page.node.delete(PDFName.of('Thumb'))
  }
}

/**
 * Comprime un PDF. `onProgress` recibe etapas reales; el progreso dentro de
 * la etapa de imágenes es real (una imagen a la vez), el resto es aproximado.
 */
export async function compressPdf(
  data: Uint8Array,
  options: CompressOptions,
  onProgress: (p: CompressProgress) => void,
): Promise<CompressResult> {
  const originalSize = data.byteLength

  onProgress({ stage: 'analizando', progress: 0.05 })
  const doc = await PDFDocument.load(data, {
    ignoreEncryption: true,
    updateMetadata: false,
  })
  onProgress({ stage: 'analizando', progress: 0.15 })

  removePageThumbnails(doc)
  if (options.stripMetadata) stripMetadataAndAnnots(doc)

  const cfg = LEVEL_CONFIG[options.level]
  let imagesProcessed = 0
  if (cfg) {
    onProgress({ stage: 'imagenes', progress: 0.2 })
    imagesProcessed = await recompressEmbeddedImages(
      doc,
      originalSize,
      cfg,
      (done, total) => {
        const frac = total === 0 ? 1 : done / total
        onProgress({ stage: 'imagenes', progress: 0.2 + frac * 0.55 })
      },
    )
  }

  onProgress({ stage: 'reconstruyendo', progress: 0.8 })
  const saved = await doc.save({ useObjectStreams: true, updateFieldAppearances: false })
  const bytes = new Uint8Array(saved.length)
  bytes.set(saved)

  onProgress({ stage: 'listo', progress: 1 })

  // Nunca devolvemos un archivo mayor que el original.
  const noGain = bytes.length >= originalSize
  return {
    bytes: noGain ? data : bytes,
    originalSize,
    compressedSize: noGain ? originalSize : bytes.length,
    noGain,
    imagesProcessed,
  }
}

/** Nombre de descarga: `documento.pdf` → `documento-comprimido.pdf`. */
export function compressedName(name: string): string {
  const base = name.replace(/\.pdf$/i, '')
  return `${base}-comprimido.pdf`
}

/** Descarga un Blob/bytes como archivo. */
export function downloadBytes(bytes: Uint8Array, filename: string): void {
  const copy = new Uint8Array(bytes.length)
  copy.set(bytes)
  const blob = new Blob([copy.buffer], { type: 'application/pdf' })
  triggerDownload(blob, filename)
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Liberamos la URL tras un margen para que el navegador inicie la descarga.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
