import { motion } from 'framer-motion'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

/* ── Atajos de teclado ─────────────────────────────────────── */

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ['Ctrl', 'clic'], label: 'Selección múltiple' },
  { keys: ['Supr'], label: 'Eliminar' },
  { keys: ['R'], label: 'Rotar' },
  { keys: ['Ctrl', 'Z'], label: 'Deshacer' },
  { keys: ['Ctrl', 'S'], label: 'Exportar' },
]

export function ShortcutsStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-2xl border border-line bg-white px-5 py-4 shadow-card"
    >
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Atajos</span>
      {SHORTCUTS.map((s, i) => (
        <motion.span
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
          className="flex items-center gap-1.5 text-xs text-ink-soft"
        >
          {s.keys.map((k) => (
            <motion.kbd
              key={k}
              whileHover={{ y: -2, boxShadow: '0 4px 10px rgba(23,20,31,.12)' }}
              className="rounded-md border border-line bg-paper-deep px-2 py-1 font-mono text-[11px] font-semibold text-ink shadow-sm"
            >
              {k}
            </motion.kbd>
          ))}
          {s.label}
        </motion.span>
      ))}
    </motion.div>
  )
}

/* ── FAQ corta + CTA cruzado ───────────────────────────────── */

const FAQS = [
  {
    q: '¿Puedo editar el texto de una página?',
    a: (
      <>
        No: este editor trabaja con páginas completas (reordenar, rotar, duplicar, eliminar y
        extraer). Modificar el texto interno de un PDF requiere reescribir el contenido del
        documento, algo mucho más delicado. Te lo contamos en{' '}
        <Link to="/como-funciona" className="font-semibold text-violet-deep underline underline-offset-2">
          Cómo funciona
        </Link>
        .
      </>
    ),
  },
  {
    q: '¿Hay límite de páginas?',
    a: 'No hay límite impuesto por nosotros: todo depende de la memoria de tu dispositivo. Lo hemos probado con documentos de más de 500 páginas sin problema. Si el archivo es muy grande, la carga de miniaturas puede tardar un poco más.',
  },
  {
    q: '¿Se guarda algo en la nube?',
    a: 'Nada. El PDF se abre, se edita y se exporta íntegramente en tu navegador con tecnologías libres (pdf-lib y PDF.js). No hay servidores, cuentas ni subidas: tu archivo nunca sale de tu dispositivo.',
  },
]

export function EditorFaq() {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <motion.h2
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-center font-display text-2xl font-bold text-ink sm:text-3xl"
      >
        Preguntas rápidas del editor
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-6 rounded-2xl border border-line bg-white px-6 shadow-card"
      >
        <Accordion type="single" collapsible>
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-base font-semibold text-ink hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-ink-soft">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-8 flex flex-col items-center gap-3 rounded-2xl bg-violet-soft px-6 py-8 text-center"
      >
        <p className="font-display text-xl font-bold text-ink">¿El archivo pesa demasiado?</p>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/comprimir"
            className="inline-flex items-center gap-2 rounded-xl bg-violet px-5 py-3 text-sm font-semibold text-white shadow-card transition-colors hover:bg-violet-deep"
          >
            Comprímelo aquí
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
