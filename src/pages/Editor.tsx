import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { ChevronRight, FileWarning, Lock, ShieldAlert } from 'lucide-react'
import { Toaster } from '@/components/ui/sonner'
import { usePdfEditor } from '@/sections/editor/usePdfEditor'
import EditorDropzone from '@/sections/editor/EditorDropzone'
import EditorWorkspace from '@/sections/editor/EditorWorkspace'
import { EditorFaq, ShortcutsStrip } from '@/sections/editor/EditorFaq'

const TITLE_WORDS = ['Editor', 'de', 'páginas', 'PDF']

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

export default function Editor() {
  const editor = usePdfEditor()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Atajos de teclado globales (solo con documento cargado)
  useEffect(() => {
    if (!editor.loaded) return
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        editor.undo()
        return
      }
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault()
        void editor.exportPdf()
        return
      }
      if (isTypingTarget(e.target)) return
      if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        editor.selectAll()
        return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        editor.deleteSelected()
        return
      }
      if (e.key.toLowerCase() === 'r' && !mod) {
        editor.rotateSelected()
        return
      }
      if (e.key === 'Escape') {
        editor.clearSelection()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [editor])

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 lg:py-16">
      <Toaster position="bottom-right" richColors closeButton />

      {/* ── Sección 1: cabecera ── */}
      <header className="mb-10">
        <nav aria-label="Migas de pan" className="flex items-center gap-1 text-xs text-ink-soft">
          <Link to="/" className="transition-colors hover:text-violet-deep">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-ink">Editor</span>
        </nav>

        <h1 className="mt-4 font-display text-4xl font-bold text-ink sm:text-5xl" aria-label="Editor de páginas PDF">
          {TITLE_WORDS.map((word, i) => (
            <motion.span
              key={word}
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.08 + i * 0.07, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="mr-3 inline-block last:mr-0"
            >
              {word === 'PDF' ? <span className="text-gradient-violet">{word}</span> : word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
          className="mt-4 max-w-2xl text-base text-ink-soft sm:text-lg"
        >
          Reorganiza tu documento hoja a hoja. Arrastra, rota, elimina y exporta un PDF nuevo.
          Tu original queda intacto.
        </motion.p>

        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 16 }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-mint/50 bg-mint/10 px-3 py-1.5 text-xs font-semibold text-mint"
        >
          <Lock className="h-3.5 w-3.5" />
          100% local — tus archivos nunca salen del navegador
        </motion.span>
      </header>

      {/* ── Estados de error ── */}
      {editor.error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 flex flex-col items-start gap-3 rounded-2xl border border-coral/40 bg-coral/5 p-5 sm:flex-row sm:items-center"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-coral/15 text-coral">
            {editor.error === 'protected' ? <ShieldAlert className="h-5 w-5" /> : <FileWarning className="h-5 w-5" />}
          </span>
          <div className="flex-1">
            <p className="font-display text-base font-bold text-ink">
              {editor.error === 'protected'
                ? 'Este PDF está protegido'
                : editor.error === 'not-pdf'
                  ? 'Eso no parece un PDF'
                  : 'No pudimos leer este archivo'}
            </p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {editor.error === 'protected'
                ? 'La edición de PDFs protegidos con contraseña no está soportada todavía.'
                : editor.error === 'not-pdf'
                  ? 'El editor solo acepta archivos con formato .pdf.'
                  : 'El archivo parece dañado o usa un formato que no reconocemos.'}
            </p>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-violet-deep"
          >
            Elegir otro archivo
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void editor.loadFile(file)
              e.target.value = ''
            }}
          />
        </motion.div>
      )}

      {/* ── Secciones 2 y 3: estado vacío / workspace ── */}
      {editor.loaded ? (
        <EditorWorkspace editor={editor} />
      ) : (
        <EditorDropzone onFile={(f) => void editor.loadFile(f)} loading={editor.loading} />
      )}

      {/* ── Sección 4: atajos ── */}
      <div className="mt-10">
        <ShortcutsStrip />
      </div>

      {/* ── Sección 5: FAQ + CTA cruzado ── */}
      <div className="mt-16 lg:mt-20">
        <EditorFaq />
      </div>
    </div>
  )
}
