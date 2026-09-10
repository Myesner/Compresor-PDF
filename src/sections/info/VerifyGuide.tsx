import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { ShieldCheck, Globe } from 'lucide-react'

const STEPS = [
  {
    title: 'Abre PDFácil y pulsa F12 → pestaña Red.',
    copy: 'En Firefox también vale Ctrl+Shift+E. No necesitas saber programar.',
  },
  {
    title: 'Comprime o edita cualquier PDF.',
    copy: 'Usa el documento más privado que tengas: es la prueba definitiva.',
  },
  {
    title: 'Observa: cero peticiones llevan tu documento.',
    copy: 'Solo verás fuentes y estáticos de la propia web. Nada más.',
  },
]

const NET_ROWS = [
  { name: 'space-grotesk.woff2', type: 'font', size: '31,2 KB', time: '84 ms' },
  { name: 'index.css', type: 'stylesheet', size: '18,7 KB', time: '42 ms' },
  { name: 'logo.svg', type: 'svg', size: '2,1 KB', time: '12 ms' },
  { name: 'inter.woff2', type: 'font', size: '29,8 KB', time: '76 ms' },
]

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const itemVariants: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
}

const mockVariants: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0.4 },
  visible: {
    clipPath: 'inset(0% 0% 0% 0%)',
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.15, delayChildren: 0.5 },
  },
}

const rowVariants: Variants = {
  hidden: { x: -16, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

/**
 * Sección 3 de /privacidad — "Compruébalo tú mismo".
 * Mini-guía de 3 pasos + mock de la pestaña Red de DevTools construido con divs.
 * Animado con Framer Motion (aislado de GSAP).
 */
export default function VerifyGuide() {
  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl bg-ink px-6 py-12 text-white md:px-12 md:py-16">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Pasos */}
            <div>
              <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-mint">
                Verificación empírica
              </span>
              <h2 className="mt-4 text-[clamp(1.75rem,3.5vw,2.5rem)] text-white">
                Compruébalo tú mismo
              </h2>
              <p className="mt-4 leading-relaxed text-white/60">
                No tienes que creernos. Tu navegador te muestra exactamente lo que sale de tu
                equipo — y lo que no.
              </p>
              <motion.ol
                variants={listVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-20%' }}
                className="mt-8 space-y-6"
              >
                {STEPS.map((step, i) => (
                  <motion.li key={step.title} variants={itemVariants} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet font-mono text-sm font-semibold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{step.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">{step.copy}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ol>
            </div>

            {/* Mock de DevTools */}
            <motion.div
              whileHover={{ rotateX: 2.5, rotateY: -3 }}
              style={{ transformPerspective: 900 }}
              className="will-change-transform"
            >
              <motion.div
                variants={mockVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-15%' }}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#100E17] shadow-lift"
              >
                {/* Barra de ventana */}
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                  <span className="h-3 w-3 rounded-full bg-coral/80" />
                  <span className="h-3 w-3 rounded-full bg-amber/80" />
                  <span className="h-3 w-3 rounded-full bg-mint/80" />
                  <span className="ml-3 font-mono text-xs text-white/40">
                    Herramientas de desarrollo
                  </span>
                </div>
                {/* Pestañas */}
                <div className="flex gap-1 border-b border-white/10 px-3 pt-2 font-mono text-xs">
                  {['Elementos', 'Consola', 'Red', 'Fuentes'].map((tab) => (
                    <span
                      key={tab}
                      className={
                        tab === 'Red'
                          ? 'rounded-t-lg bg-white/10 px-3 py-1.5 font-semibold text-white'
                          : 'px-3 py-1.5 text-white/40'
                      }
                    >
                      {tab}
                    </span>
                  ))}
                </div>
                {/* Toolbar + contador */}
                <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-mono text-xs text-white/40">
                    <Globe className="h-3.5 w-3.5" />
                    Conservar registro · Todos
                  </span>
                  <span className="inline-flex items-baseline gap-2">
                    <span className="font-mono text-4xl font-semibold leading-none text-mint">0</span>
                    <span className="font-mono text-xs text-white/50">
                      peticiones con tu PDF
                    </span>
                  </span>
                </div>
                {/* Filas de red */}
                <div className="divide-y divide-white/5 px-4 py-1">
                  {NET_ROWS.map((row) => (
                    <motion.div
                      key={row.name}
                      variants={rowVariants}
                      className="flex items-center gap-3 py-2.5 font-mono text-xs"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full bg-violet/70" />
                      <span className="truncate text-white/80">{row.name}</span>
                      <span className="ml-auto shrink-0 text-white/35">{row.type}</span>
                      <span className="w-16 shrink-0 text-right text-white/50">{row.size}</span>
                      <span className="w-14 shrink-0 text-right text-white/35">{row.time}</span>
                    </motion.div>
                  ))}
                </div>
                {/* Banner final */}
                <motion.div
                  variants={rowVariants}
                  className="flex items-center gap-2 border-t border-white/10 bg-mint/10 px-4 py-3"
                >
                  <ShieldCheck className="h-4 w-4 shrink-0 text-mint" />
                  <p className="font-mono text-xs text-mint">
                    Tu PDF no aparece en ninguna petición: nunca salió de tu dispositivo.
                  </p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
