import { FileCog, BookOpen, Atom, Globe, ArrowUpRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Reveal from '@/components/Reveal'

interface Tool {
  icon: LucideIcon
  name: string
  description: string
  license: string
  href: string
  linkLabel: string
}

const TOOLS: Tool[] = [
  {
    icon: FileCog,
    name: 'pdf-lib',
    description: 'Crear y modificar PDFs en JavaScript. Licencia MIT.',
    license: 'MIT',
    href: 'https://pdf-lib.js.org/',
    linkLabel: 'pdf-lib.js.org',
  },
  {
    icon: BookOpen,
    name: 'PDF.js (Mozilla)',
    description: 'El visor de PDF de Firefox, abierto desde 2011. Licencia Apache-2.0.',
    license: 'Apache-2.0',
    href: 'https://mozilla.github.io/pdf.js/',
    linkLabel: 'mozilla.github.io/pdf.js',
  },
  {
    icon: Atom,
    name: 'React + Vite',
    description: 'Interfaz rápida y moderna, open-source.',
    license: 'MIT',
    href: 'https://react.dev/',
    linkLabel: 'react.dev',
  },
  {
    icon: Globe,
    name: 'Tu navegador',
    description: "La 'infraestructura' eres tú: Web Workers, canvas y la API File.",
    license: 'Web APIs',
    href: 'https://developer.mozilla.org/es/docs/Web/API',
    linkLabel: 'developer.mozilla.org',
  },
]

/**
 * Sección 4 de /como-funciona — "Hecho con herramientas libres y gratuitas".
 * Grid de tarjetas con hover elevado e iconos rotados (CSS puro).
 */
export default function FreeSoftware() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-violet">
            Open source
          </span>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3rem)] text-ink">
            Hecho con herramientas libres y gratuitas
          </h2>
        </Reveal>

        <Reveal
          staggerChildren
          stagger={0.1}
          className="mt-12 grid gap-6 sm:grid-cols-2"
        >
          {TOOLS.map((tool) => (
            // El wrapper recibe la animación GSAP; la tarjeta interna conserva el hover CSS.
            <div key={tool.name}>
              <div className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-soft transition-transform duration-300 group-hover:rotate-6">
                  <tool.icon className="h-6 w-6 text-violet" />
                </span>
                <span className="rounded-full bg-paper-deep px-3 py-1 font-mono text-xs text-ink-soft">
                  {tool.license}
                </span>
              </div>
              <h3 className="mt-4 text-lg text-ink">{tool.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">
                {tool.description}
              </p>
              <a
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 font-mono text-xs font-semibold text-violet transition-colors hover:text-violet-deep"
              >
                {tool.linkLabel}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal className="mx-auto mt-12 max-w-2xl text-center">
          <p className="text-lg leading-relaxed text-ink">
            Cero librerías de pago, cero APIs con factura, cero cuentas de desarrollador.{' '}
            <span className="font-semibold text-violet-deep">
              Por eso podemos ser gratis para siempre.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
