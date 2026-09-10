import { Link } from 'react-router'
import { motion } from 'framer-motion'
import { FileDown, FileEdit, Terminal } from 'lucide-react'
import Reveal from '@/components/Reveal'

interface InfoCtaProps {
  title: string
  /** Guiño técnico opcional que aparece con delay 0.4s. */
  note?: string
}

/** CTA final compartido por las páginas de información. */
export default function InfoCta({ title, note }: InfoCtaProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 text-center">
        <Reveal>
          <h2 className="text-[clamp(2rem,4vw,3rem)] text-ink">{title}</h2>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/comprimir"
                className="inline-flex items-center gap-2 rounded-xl bg-violet px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-deep"
              >
                <FileDown className="h-4 w-4" />
                Comprimir un PDF
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/editor"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-6 py-3.5 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-violet hover:text-violet-deep"
              >
                <FileEdit className="h-4 w-4" />
                Editar páginas
              </Link>
            </motion.div>
          </div>
        </Reveal>
        {note && (
          <Reveal delay={0.4} y={12}>
            <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-paper-deep px-4 py-2 font-mono text-xs text-ink-soft">
              <Terminal className="h-3.5 w-3.5 shrink-0 text-violet" />
              {note}
            </p>
          </Reveal>
        )}
      </div>
    </section>
  )
}
