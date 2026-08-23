import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { APP_NAME } from '@/utils/constants'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-secondary-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <nav className="container-app flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">VE</span>
          </div>
          <span className="font-semibold text-lg text-secondary-900 hidden sm:inline">
            {APP_NAME}
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#como-funciona" className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors">
            Cómo funciona
          </a>
          <a href="#planes" className="text-sm text-secondary-600 hover:text-secondary-900 transition-colors">
            Planes
          </a>
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Ingresar
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">
              Crear cuenta gratis
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          className="md:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 focus-ring"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-secondary-200 bg-white animate-fade-in">
          <div className="container-app py-4 flex flex-col gap-3">
            <a
              href="#como-funciona"
              className="text-sm text-secondary-600 hover:text-secondary-900 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Cómo funciona
            </a>
            <a
              href="#planes"
              className="text-sm text-secondary-600 hover:text-secondary-900 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Planes
            </a>
            <hr className="border-secondary-200" />
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <Button variant="outline" fullWidth>
                Ingresar
              </Button>
            </Link>
            <Link to="/register" onClick={() => setIsMenuOpen(false)}>
              <Button fullWidth>
                Crear cuenta gratis
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
