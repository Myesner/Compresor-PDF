import { Server, UserCheck } from 'lucide-react'
import Reveal from '@/components/Reveal'

const CARDS = [
  {
    icon: Server,
    title: 'Datos técnicos anónimos',
    copy: 'Si el hosting lo provee, registros estándar de servidor (IP, navegador) con retención mínima. Nunca contenido de archivos, nunca perfiles.',
  },
  {
    icon: UserCheck,
    title: 'Tu responsabilidad',
    copy: 'Como todo ocurre en tu dispositivo, tú controlas tus archivos. Si el dispositivo es compartido, cierra la pestaña al terminar.',
  },
]

/**
 * Sección 4 de /privacidad — "Lo mínimo que sí pasa".
 * Honestidad sobre los datos técnicos que no dependen de nosotros.
 */
export default function Honesty() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-mint">
            Transparencia total
          </span>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] text-ink">Lo mínimo que sí pasa</h2>
        </Reveal>

        <Reveal staggerChildren stagger={0.15} className="mt-10 grid gap-6 md:grid-cols-2">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-line bg-white p-6 shadow-card md:p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-mint/15">
                <card.icon className="h-6 w-6 text-mint" />
              </span>
              <h3 className="mt-4 text-lg text-ink">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{card.copy}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
