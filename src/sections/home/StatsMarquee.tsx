import { motion } from 'framer-motion'

const ITEMS = [
  '0 € para siempre',
  '0 servidores',
  '0 registros',
  '0 líneas de código de pago',
  '∞ archivos',
]

function MarqueeContent() {
  return (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center">
          <span className="whitespace-nowrap px-6 font-mono text-sm font-semibold text-white md:text-base">
            {item}
          </span>
          <span className="text-violet" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  )
}

/** Franja oscura con marquee infinito de estadísticas. */
export default function StatsMarquee() {
  return (
    <motion.section
      initial={{ y: '100%' }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Datos clave"
      className="group overflow-hidden bg-ink py-5"
    >
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </motion.section>
  )
}
