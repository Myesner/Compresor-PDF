import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Reveal from '@/components/Reveal'

const FAQS = [
  {
    q: '¿Por qué mi PDF apenas bajó de peso?',
    a: 'Porque probablemente ya estaba optimizado o está compuesto sobre todo por texto y gráficos vectoriales, que ocupan muy poco. La compresión más agresiva actúa sobre las imágenes embebidas: si el documento no tiene imágenes (o ya están muy comprimidas), el ahorro será pequeño. En ese caso te mostramos el aviso "Ya estaba muy optimizado" y te entregamos siempre el archivo más ligero posible, nunca uno más pesado.',
  },
  {
    q: '¿Se pierde calidad?',
    a: 'Depende del nivel. Ligera solo reorganiza la estructura interna del PDF sin tocar las imágenes: calidad idéntica. Recomendada re-comprime las imágenes JPEG con una calidad alta, imperceptible en pantalla. Extrema además reduce la resolución de las imágenes grandes, ideal para enviar por email pero no para imprenta. El texto y los vectores nunca se alteran en ningún nivel.',
  },
  {
    q: '¿Puedo comprimir un PDF protegido con contraseña?',
    a: 'De momento no: si el archivo exige contraseña para abrirse, no podemos leerlo en tu navegador y te mostraremos un aviso. Los PDFs con protección solo de copia/impresión (sin contraseña de apertura) sí se pueden comprimir con normalidad.',
  },
]

/** FAQ corta + CTA cruzado hacia el editor de páginas. */
export default function ComprimirFaq() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-4">
      <Reveal>
        <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Preguntas frecuentes
        </h2>
      </Reveal>

      <Reveal className="mt-6" y={30}>
        <Accordion type="single" collapsible className="rounded-2xl border border-line bg-white px-5 shadow-card">
          {FAQS.map((faq, i) => (
            <AccordionItem key={faq.q} value={`faq-${i}`} className="border-line">
              <AccordionTrigger className="text-left font-display text-base font-medium text-ink hover:text-violet-deep">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-ink-soft">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>

      <Reveal className="mt-10" y={30}>
        <Link
          to="/editor"
          className="group flex flex-col items-start justify-between gap-4 rounded-3xl bg-ink p-8 text-white transition-colors hover:bg-[#221d2e] sm:flex-row sm:items-center"
        >
          <div>
            <p className="font-display text-xl font-bold tracking-tight md:text-2xl">
              ¿También quieres reorganizar páginas?
            </p>
            <p className="mt-1 text-sm text-white/70">
              Reordena, rota, elimina y extrae páginas de tu PDF con el editor.
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet px-5 py-3 text-sm font-semibold transition-transform group-hover:translate-x-1">
            Abrir el editor <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </Reveal>
    </section>
  )
}
