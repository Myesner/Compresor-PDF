import { Link } from 'react-router'
import { Heart } from 'lucide-react'
import { Logo } from '@/components/Navbar'
import Reveal from '@/components/Reveal'

const TOOL_LINKS = [
  { to: '/comprimir', label: 'Comprimir PDF' },
  { to: '/editor', label: 'Editor de páginas' },
]

const RESOURCE_LINKS = [
  { to: '/como-funciona', label: 'Cómo funciona' },
  { to: '/privacidad', label: 'Privacidad' },
]

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      {/* Franja CTA */}
      <div className="border-b border-white/10">
        <Reveal className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-12 md:flex-row">
          <p className="text-center font-display text-2xl font-bold tracking-tight md:text-left md:text-3xl">
            Comprime tu primer PDF —{' '}
            <span className="text-violet-soft">tarda 10 segundos.</span>
          </p>
          <Link
            to="/comprimir"
            className="inline-flex shrink-0 items-center rounded-xl bg-violet px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-violet-deep"
          >
            Empezar ahora
          </Link>
        </Reveal>
      </div>

      {/* Columnas */}
      <Reveal
        staggerChildren
        stagger={0.08}
        className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            Tu PDF pesa menos y obedece más. Herramientas gratuitas que funcionan
            100% en tu navegador.
          </p>
        </div>

        <nav aria-label="Herramientas">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Herramientas</h3>
          <ul className="mt-4 space-y-3">
            {TOOL_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-white/70 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Recursos">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Recursos</h3>
          <ul className="mt-4 space-y-3">
            {RESOURCE_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-white/70 transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40">Hecho con software libre</h3>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-xs text-white/70">pdf-lib</span>
            <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-xs text-white/70">PDF.js</span>
            <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-xs text-white/70">React</span>
          </div>
          <p className="mt-4 flex items-center gap-1.5 text-sm text-white/60">
            Sin ánimo de lucro, con
            <Heart className="h-4 w-4 fill-coral text-coral" aria-label="amor" />
            y código abierto.
          </p>
        </div>
      </Reveal>

      {/* Línea legal */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-6 text-center text-xs text-white/50 md:flex-row md:text-left">
          <p>Tus archivos nunca salen de tu dispositivo. Sin cookies de terceros. Sin cuentas.</p>
          <p className="flex items-center gap-1.5">
            Desarrollado por
            <span className="font-semibold text-white/80">Yesner Mejia</span>
            <Heart className="h-3.5 w-3.5 fill-coral text-coral" aria-label="amor" />
          </p>
          <p className="font-mono">PDFácil · {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}
