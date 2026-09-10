import { useRef } from 'react'
import { Link } from 'react-router'
import { motion } from 'framer-motion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { Check, ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const TICKS = ['Sin subidas', 'Sin cuentas', 'Sin marcas de agua', 'Sin versión premium']
const HEADLINE = 'Tus archivos nunca salen de tu dispositivo.'

/** Sección 5 — "Todo pasa aquí": bloque violet sobre privacidad local. */
export default function PrivacySection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      // Revelado del bloque con clip-path
      gsap.fromTo(
        '.ps-block',
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.9,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: ref.current, start: 'top 75%', once: true },
        },
      )
      // Titular: split por palabra
      gsap.from('.ps-word', {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.02,
        ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 70%', once: true },
      })
      // Lista de ticks
      gsap.from('.ps-tick', {
        x: -12,
        opacity: 0,
        duration: 0.5,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.ps-ticks', start: 'top 85%', once: true },
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="relative">
      <div className="ps-block bg-violet py-16 text-white md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 className="max-w-lg text-[clamp(2rem,4vw,3rem)] text-white">
              {HEADLINE.split(' ').map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                  <span className="ps-word inline-block">
                    {w}
                    {i < HEADLINE.split(' ').length - 1 ? ' ' : ''}
                  </span>
                </span>
              ))}
            </h2>
            <p className="mt-6 max-w-lg text-white/80">
              No hay servidor que reciba tus documentos. La compresión y la edición se
              ejecutan con bibliotecas de código abierto dentro de tu navegador. Cierra
              la pestaña y no queda rastro.
            </p>
            <ul className="ps-ticks mt-8 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
              {TICKS.map((tick) => (
                <li key={tick} className="ps-tick flex items-center gap-2.5 text-sm font-medium">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-mint/25">
                    <Check className="h-4 w-4 text-mint" strokeWidth={3} />
                  </span>
                  {tick}
                </li>
              ))}
            </ul>
            <Link
              to="/privacidad"
              className="group mt-9 inline-flex items-center gap-2 rounded-xl border-2 border-white/70 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-violet-deep"
            >
              Lee nuestra privacidad
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="flex items-center justify-center">
            <motion.img
              src="/local-shield.png"
              alt="Un portátil protegido por un escudo: nada se sube a la nube"
              className="w-full max-w-[480px]"
              width={1000}
              height={800}
              animate={{ y: [0, -10, 0], scale: [1, 1.015, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
