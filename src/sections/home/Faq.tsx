import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
import Reveal from '@/components/Reveal'

const FAQ_ITEMS = [
  {
    q: '¿Es realmente gratis? ¿Dónde está el truco?',
    a: 'No hay truco: al procesarse todo en tu navegador no pagamos servidores de conversión. El proyecto usa únicamente bibliotecas open-source.',
  },
  {
    q: '¿Mis documentos están seguros?',
    a: 'Nunca salen de tu dispositivo; ni siquiera los vemos.',
  },
  {
    q: '¿Cuánto puedo comprimir un PDF?',
    a: 'Depende del contenido: PDFs con imágenes escaneadas suelen bajar 60–90%; PDFs de texto puro bajan menos.',
  },
  {
    q: '¿Qué puedo editar exactamente?',
    a: 'Reordenar, rotar, duplicar, eliminar y extraer páginas, y añadir páginas en blanco. No editamos el texto dentro de las páginas.',
  },
  {
    q: '¿Hay límite de tamaño o de archivos?',
    a: 'El límite lo pone la memoria de tu dispositivo; en la práctica, PDFs de hasta ~200 MB funcionan bien.',
  },
  {
    q: '¿Funciona en el móvil?',
    a: 'Sí, todo el flujo es táctil: arrastrar páginas incluido.',
  },
]

/** Sección 7 — FAQ con accordion (icono + que rota a ×, un item abierto). */
export default function Faq() {
  return (
    <section className="bg-paper py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <h2 className="text-center text-[clamp(2rem,4vw,3rem)] text-ink">Preguntas frecuentes</h2>
        </Reveal>

        <Reveal staggerChildren stagger={0.08} className="mt-10">
          <AccordionPrimitive.Root type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionPrimitive.Item
                key={item.q}
                value={`item-${i}`}
                className="rounded-2xl border border-line bg-white px-6 shadow-xs transition-colors data-[state=open]:border-violet/40"
              >
                <AccordionPrimitive.Header className="flex">
                  <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between gap-4 py-5 text-left font-display text-base font-medium text-ink outline-none transition-colors focus-visible:text-violet-deep [&[data-state=open]>svg]:rotate-45">
                    {item.q}
                    <Plus className="h-5 w-5 shrink-0 text-violet transition-transform duration-300" />
                  </AccordionPrimitive.Trigger>
                </AccordionPrimitive.Header>
                <AccordionPrimitive.Content className="overflow-hidden text-[0.9375rem] leading-relaxed text-ink-soft data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <p className="pb-5">{item.a}</p>
                </AccordionPrimitive.Content>
              </AccordionPrimitive.Item>
            ))}
          </AccordionPrimitive.Root>
        </Reveal>
      </div>
    </section>
  )
}
