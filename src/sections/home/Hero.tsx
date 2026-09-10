import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { FileDown, Lock, Zap, Infinity as InfinityIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { stashFiles } from '@/lib/fileTransfer'

gsap.registerPlugin(useGSAP)

/* ── Título con split por palabra (GSAP) ─────────────────────────────── */
function HeroTitle() {
  const ref = useRef<HTMLHeadingElement>(null)
  const underlineRef = useRef<SVGPathElement>(null)

  useGSAP(
    () => {
      gsap.from('.hero-word', {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.out',
      })
      const path = underlineRef.current
      if (path) {
        const len = path.getTotalLength()
        gsap.fromTo(
          path,
          { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: 0.9, delay: 0.8, ease: 'power2.inOut' },
        )
      }
    },
    { scope: ref },
  )

  const word = (text: string, key: string, className?: string) => (
    <span key={key} className="inline-block overflow-hidden pb-1 align-bottom">
      <span className={cn('hero-word inline-block', className)}>{text}</span>
    </span>
  )

  return (
    <h1
      ref={ref}
      className="text-[clamp(2.75rem,6vw,4.5rem)] leading-[1.05] font-bold text-ink"
    >
      {word('Comprime', 'w1')} {word('y', 'w2')} {word('edita', 'w3')} {word('tus', 'w4')}{' '}
      {word('PDF.', 'w5')} {word('Gratis.', 'w6', 'text-violet')}{' '}
      <span className="relative inline-block">
        {word('En', 'w7')} {word('tu', 'w8')} {word('navegador.', 'w9')}
        <svg
          className="absolute -bottom-1 left-0 h-3 w-full"
          viewBox="0 0 300 14"
          fill="none"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            ref={underlineRef}
            d="M4 10 C 60 3, 120 12, 170 7 S 270 4, 296 8"
            stroke="#FF5C38"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </span>
    </h1>
  )
}

/* ── Arte del hero con parallax de ratón (Framer Motion) ─────────────── */
function HeroArt() {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  // Capas a distintas profundidades (±10px imagen, ±20px blob)
  const imgX = useTransform(mx, (v) => v * 10)
  const imgY = useTransform(my, (v) => v * 10)
  const blobX = useTransform(mx, (v) => v * -20)
  const blobY = useTransform(my, (v) => v * -14)

  return (
    <div
      className="relative flex items-center justify-center"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      <motion.div
        style={{ x: blobX, y: blobY }}
        className="absolute h-[80%] w-[80%] rounded-full bg-violet-soft/70 blur-3xl"
        aria-hidden="true"
      />
      <motion.div
        style={{ x: imgX, y: imgY }}
        animate={{ y: [0, -14, 0], rotate: [0, 1.5, 0], scale: [1, 0.985, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <img
          src="/hero-pages.png"
          alt="Hojas PDF flotando, una de ellas comprimida por dos flechas"
          className="w-full max-w-[560px] drop-shadow-xl"
          width={1200}
          height={1200}
        />
      </motion.div>
    </div>
  )
}

/* ── Mini dropzone del hero ──────────────────────────────────────────── */
function MiniDropzone() {
  const [dragOver, setDragOver] = useState(false)
  const navigate = useNavigate()

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return
    stashFiles(files)
    navigate('/comprimir')
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        'relative flex max-w-md items-center gap-3 rounded-2xl border-2 border-dashed px-5 py-4 transition-colors',
        dragOver ? 'cursor-copy border-solid border-violet bg-violet-soft' : 'border-violet/50 bg-paper-deep/60',
      )}
    >
      {!dragOver && (
        <span className="pointer-events-none absolute inset-0 animate-breathe rounded-2xl border-2 border-dashed border-violet/60" aria-hidden="true" />
      )}
      <FileDown className={cn('h-6 w-6 shrink-0', dragOver ? 'text-violet-deep' : 'text-violet')} />
      <p className="text-sm font-medium text-ink-soft">
        O <span className="font-semibold text-ink">arrastra un PDF aquí</span> para empezar
      </p>
    </div>
  )
}

/* ── Sección Hero ────────────────────────────────────────────────────── */
export default function Hero() {
  return (
    <section className="hero-radial relative flex min-h-[92vh] items-center overflow-hidden">
      <div className="noise-overlay absolute inset-0" aria-hidden="true" />
      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-[55fr_45fr] lg:py-0">
        {/* Columna de texto */}
        <div>
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold text-ink-soft shadow-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-mint" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
            </span>
            100% gratis · Sin registro · Sin límites
          </motion.span>

          <div className="mt-6">
            <HeroTitle />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="mt-6 max-w-xl text-[1.0625rem] text-ink-soft"
          >
            Reduce el peso de tus documentos y reordena, rota o elimina páginas.
            Sin subir nada a ningún servidor: todo ocurre en tu dispositivo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/comprimir"
                className="inline-flex items-center rounded-xl bg-violet px-7 py-3.5 text-base font-semibold text-white shadow-lift transition-colors hover:bg-violet-deep"
              >
                Comprimir PDF
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/editor"
                className="inline-flex items-center rounded-xl border-2 border-ink/80 px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink hover:bg-ink hover:text-white"
              >
                Editar páginas
              </Link>
            </motion.div>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65, ease: 'easeOut' }}
            className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-soft"
          >
            <li className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-violet" /> Nada se sube
            </li>
            <li className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-violet" /> Sin esperas de cola
            </li>
            <li className="flex items-center gap-2">
              <InfinityIcon className="h-4 w-4 text-violet" /> Sin límite de archivos
            </li>
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75, ease: 'easeOut' }}
            className="mt-7"
          >
            <MiniDropzone />
          </motion.div>
        </div>

        {/* Columna visual */}
        <HeroArt />
      </div>
    </section>
  )
}
