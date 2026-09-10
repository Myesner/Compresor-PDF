// Genera public/pdf.worker.min.mjs: copia verbatim el worker de pdfjs-dist.
// Uso: npm run sync:worker  (ejecutar tras actualizar pdfjs-dist).
//
 // Por qué no importarlo de node_modules con `?url`: en dev, Vite transforma
// el archivo y le inyecta `/@vite/client`; el worker cuelga al iniciar el HMR
// dentro del worker (getDocument nunca resuelve). Los archivos en `public/`
// se sirven sin transformación.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
const dest = join(root, 'public/pdf.worker.min.mjs')

writeFileSync(dest, readFileSync(src))
console.log('worker copiado a public/ (ejecutar tras cada update de pdfjs-dist)')
