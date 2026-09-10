import type { LucideIcon } from 'lucide-react'

interface StubPageProps {
  icon: LucideIcon
  title: string
  description: string
}

/** Esqueleto provisional para las páginas de herramienta (las implementa otro agente). */
export default function StubPage({ icon: Icon, title, description }: StubPageProps) {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center md:py-32">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-soft">
        <Icon className="h-8 w-8 text-violet" />
      </span>
      <h1 className="mt-6 text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-xl text-ink-soft">{description}</p>
    </section>
  )
}
