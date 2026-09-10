/**
 * Transferencia efímera de archivos entre páginas (p. ej. soltar un PDF en el
 * hero de la home y continuar en /comprimir). Los File viven solo en memoria;
 * nunca se suben a ningún servidor.
 */
let stashed: File[] = []

export function stashFiles(files: File[]): void {
  stashed = files.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'))
}

/** Devuelve los archivos guardados y limpia el almacén (un solo consumo). */
export function takeStashedFiles(): File[] {
  const files = stashed
  stashed = []
  return files
}

export function hasStashedFiles(): boolean {
  return stashed.length > 0
}
