import { memo } from 'react'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import Reveal from '@/components/Reveal'

/* Sobre que "tiembla" cada ~5s (bucle aislado en micro-componente memoizado) */
const WiggleMail = memo(function WiggleMail() {
  return (
    <motion.span
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-card"
      animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
      transition={{ duration: 0.7, repeat: Infinity, repeatDelay: 4.3, ease: 'easeInOut' }}
    >
      <Mail className="h-6 w-6 text-violet" />
    </motion.span>
  )
})

const UPDATED = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(new Date())

/**
 * Sección 5 de /privacidad — contacto y cambios de la política.
 */
export default function Contact() {
  return (
    <section className="pb-16 md:pb-24">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal>
          <div className="flex flex-col items-start gap-5 rounded-3xl bg-violet-soft p-8 sm:flex-row md:p-10">
            <WiggleMail />
            <div>
              <h2 className="text-2xl text-ink">Contacto y cambios</h2>
              <p className="mt-3 leading-relaxed text-ink">
                ¿Dudas sobre privacidad? Escríbenos:{' '}
                <a
                  href="mailto:yesnermejia07@gmail.com"
                  className="font-mono text-sm font-semibold text-violet-deep underline decoration-violet/40 underline-offset-4 transition-colors hover:text-violet"
                >
                  yesnermejia07@gmail.com
                </a>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Si esta política cambia, lo anunciaremos aquí con fecha. Última actualización:{' '}
                <span className="font-mono text-xs">{UPDATED}</span>.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
