import type { CompressStage } from './compress'

export type FileStatus = 'ready' | 'processing' | 'done' | 'error'

export interface PdfFileItem {
  id: string
  file: File
  /** Bytes del PDF (se leen una sola vez al cargar). */
  data: Uint8Array
  size: number
  /** Miniatura de la portada (data URL), null mientras se renderiza. */
  thumb: string | null
  status: FileStatus
  stage: CompressStage
  /** 0 → 1 */
  progress: number
  result?: {
    bytes: Uint8Array
    size: number
    name: string
    noGain: boolean
  }
  error?: string
}

export const STAGE_LABELS: Record<CompressStage, string> = {
  analizando: 'Analizando estructura…',
  imagenes: 'Re-comprimiendo imágenes…',
  reconstruyendo: 'Reconstruyendo PDF…',
  listo: '¡Listo!',
}

let counter = 0
export function newId(): string {
  counter += 1
  return `pdf-${Date.now()}-${counter}`
}
