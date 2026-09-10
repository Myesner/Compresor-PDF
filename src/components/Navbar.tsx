import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { to: '/', label: 'Inicio' },
  { to: '/comprimir', label: 'Comprimir' },
  { to: '/editor', label: 'Editor' },
  { to: '/como-funciona', label: 'Cómo funciona' },
  { to: '/privacidad', label: 'Privacidad' },
]

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="PDFácil — inicio">
      <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="" className="h-9 w-9 rounded-xl" />
      <span className={cn('font-display text-xl font-bold tracking-tight', dark ? 'text-white' : 'text-ink')}>
        PDF<span className="text-violet">á</span>cil
      </span>
    </Link>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cierra el drawer al cambiar de ruta
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
      className={cn(
        'sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md transition-colors',
        scrolled ? 'border-line' : 'border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />

        {/* Links desktop */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                cn(
                  'group relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-violet-soft text-violet-deep' : 'text-ink-soft hover:text-ink',
                )
              }
            >
              {link.label}
              <span className="absolute inset-x-4 -bottom-px h-0.5 origin-left scale-x-0 rounded-full bg-violet transition-transform duration-300 group-hover:scale-x-100" />
            </NavLink>
          ))}
        </nav>

        {/* Acciones derecha */}
        <div className="hidden items-center gap-3 lg:flex">
          <span className="rounded-full border border-mint/60 px-3 py-1 text-xs font-semibold text-mint">
            100% gratis
          </span>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              to="/comprimir"
              className="inline-flex items-center rounded-xl bg-violet px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-violet-deep"
            >
              Comprimir ahora
            </Link>
          </motion.div>
        </div>

        {/* Hamburguesa móvil */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Drawer móvil — portado a <body>: el backdrop-blur del header crea
          containing block y rompería position:fixed de estos descendientes */}
      {createPortal(
        <AnimatePresence>
          {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col bg-white p-6 shadow-lift lg:hidden"
            >
              <div className="flex items-center justify-between">
                <Logo />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink"
                  aria-label="Cerrar menú"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <nav className="mt-8 flex flex-col gap-1" aria-label="Navegación móvil">
                {NAV_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      cn(
                        'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                        isActive ? 'bg-violet-soft text-violet-deep' : 'text-ink-soft hover:bg-paper-deep hover:text-ink',
                      )
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto flex flex-col gap-3">
                <span className="self-start rounded-full border border-mint/60 px-3 py-1 text-xs font-semibold text-mint">
                  100% gratis
                </span>
                <Link
                  to="/comprimir"
                  className="inline-flex items-center justify-center rounded-xl bg-violet px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-deep"
                >
                  Comprimir ahora
                </Link>
              </div>
            </motion.aside>
          </>
        )}
        </AnimatePresence>,
        document.body,
      )}
    </motion.header>
  )
}
