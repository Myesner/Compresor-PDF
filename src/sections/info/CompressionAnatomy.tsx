import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { AlertTriangle, FileSearch } from 'lucide-react'
import Reveal from '@/components/Reveal'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface Segment {
  id: string
  label: string
  pct: number
  color: string
}

const SEGMENTS: Segment[] = [
  { id: 'imagenes', label: 'Imágenes', pct: 78, color: '#6C4DF6' },
  { id: 'fuentes', label: 'Fuentes', pct: 9, color: '#FF5C38' },
  { id: 'estructura', label: 'Estructura', pct: 8, color: '#25C685' },
  { id: 'metadatos', label: 'Metadatos', pct: 5, color: '#FFB020' },
]

interface Block {
  title: string
  copy: string
  /** Segmentos que se iluminan cuando el scroll alcanza este bloque. */
  active: string[] | null
}

const BLOCKS: Block[] = [
  {
    title: 'Re-compresión de imágenes',
    copy: 'Las imágenes suelen ser el 70–90% del peso. Las redibujamos a menor resolución/calidad JPEG según el nivel elegido.',
    active: ['imagenes'],
  },
  {
    title: 'Limpieza estructural',
    copy: 'Eliminamos objetos huérfanos, flujos duplicados y metadatos innecesarios (opcional).',
    active: ['estructura', 'metadatos'],
  },
  {
    title: 'Re-escritura eficiente',
    copy: 'pdf-lib re-guarda el documento con streams compactados.',
    active: null,
  },
]

/**
 * Sección 3 de /como-funciona — "¿De dónde sale el ahorro?"
 * Texto explicativo + radiografía de un PDF (barra apilada que crece por
 * segmentos y se ilumina según el párrafo visible).
 */
export default function CompressionAnatomy() {
  const ref = useRef<HTMLDivElement>(null)
  const blocksRef = useRef<(HTMLDivElement | null)[]>([])
  const noteRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string[] | null>(null)

  useGSAP(
    () => {
      // La barra crece por segmentos al entrar en viewport
      gsap.from('.anatomy-seg', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: { trigger: '.anatomy-bar', start: 'top 80%', once: true },
      })

      // Cada párrafo ilumina su segmento al entrar en la zona central
      blocksRef.current.forEach((block, i) => {
        if (!block) return
        ScrollTrigger.create({
          trigger: block,
          start: 'top 65%',
          end: 'bottom 40%',
          onEnter: () => setActive(BLOCKS[i].active),
          onEnterBack: () => setActive(BLOCKS[i].active),
          onLeaveBack: () => setActive(i === 0 ? null : BLOCKS[i - 1].active),
        })
      })

      // Nota amber: entra desde la izquierda
      if (noteRef.current) {
        gsap.from(noteRef.current, {
          x: -20,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: noteRef.current, start: 'top 85%', once: true },
        })
      }
    },
    { scope: ref },
  )

  return (
    <section className="bg-paper-deep py-16 md:py-24">
      <div ref={ref} className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2 md:gap-16">
        {/* Texto explicativo */}
        <div>
          <Reveal>
            <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-violet">
              Compresión
            </span>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] text-ink">¿De dónde sale el ahorro?</h2>
          </Reveal>
          <div className="mt-8 space-y-8">
            {BLOCKS.map((block, i) => (
              <div
                key={block.title}
                ref={(el) => {
                  blocksRef.current[i] = el
                }}
              >
                <h3 className="flex items-center gap-2 text-xl text-ink">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        block.active === null
                          ? '#17141F'
                          : SEGMENTS.find((s) => s.id === block.active![0])?.color,
                    }}
                    aria-hidden="true"
                  />
                  {block.title}
                </h3>
                <p className="mt-2 leading-relaxed text-ink-soft">{block.copy}</p>
              </div>
            ))}
          </div>

          <div
            ref={noteRef}
            className="mt-10 flex gap-3 rounded-2xl border border-amber/40 bg-amber/10 p-5"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber" />
            <p className="text-sm leading-relaxed text-ink">
              <strong className="font-semibold">Honestidad primero:</strong> un PDF de texto puro
              casi no baja de peso: no hay imágenes que optimizar. Te lo diremos antes de que lo
              descubras.
            </p>
          </div>
        </div>

        {/* Radiografía del PDF */}
        <Reveal className="md:sticky md:top-24 md:self-start">
          <div className="rounded-3xl border border-line bg-white p-6 shadow-card md:p-8">
            <div className="flex items-center justify-between gap-4">
              <h3 className="flex items-center gap-2 text-lg text-ink">
                <FileSearch className="h-5 w-5 text-violet" />
                Radiografía de un PDF típico
              </h3>
            </div>
            <p className="mt-1 font-mono text-xs text-ink-soft">informe-anual.pdf · 24,6 MB</p>

            <div
              className="anatomy-bar mt-6 flex h-14 w-full overflow-hidden rounded-2xl"
              role="img"
              aria-label="Composición típica de un PDF: imágenes 78%, fuentes 9%, estructura 8%, metadatos 5%"
            >
              {SEGMENTS.map((seg) => (
                <div
                  key={seg.id}
                  className={cn(
                    'anatomy-seg flex items-center justify-center transition-opacity duration-300',
                    active !== null && !active.includes(seg.id) && 'opacity-40',
                  )}
                  style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                >
                  {seg.pct >= 8 && (
                    <span className="font-mono text-xs font-semibold text-white">{seg.pct}%</span>
                  )}
                </div>
              ))}
            </div>

            <ul className="mt-5 grid grid-cols-2 gap-3">
              {SEGMENTS.map((seg) => (
                <li
                  key={seg.id}
                  className={cn(
                    'flex items-center gap-2 text-sm transition-opacity duration-300',
                    active !== null && !active.includes(seg.id) && 'opacity-40',
                  )}
                >
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: seg.color }}
                    aria-hidden="true"
                  />
                  <span className="text-ink">{seg.label}</span>
                  <span className="ml-auto font-mono text-xs text-ink-soft">{seg.pct}%</span>
                </li>
              ))}
            </ul>

            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft">
              Composición orientativa de un PDF escaneado o con fotos. Cada documento es distinto:
              por eso analizamos el tuyo antes de comprimir.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
