import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { APP_NAME } from '@/utils/constants'
import { useAuth } from '@/contexts/AuthContext'

export function DashboardNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { signOut, user } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Logo + mobile toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 focus-ring"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menú de navegación"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">VE</span>
            </div>
            <span className="font-semibold text-secondary-900 hidden sm:inline">
              {APP_NAME}
            </span>
          </Link>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center hover:ring-2 hover:ring-primary-200 transition-all"
              title={user?.email ?? ''}
            >
              <span className="text-primary-700 font-medium text-sm">
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 top-10 w-56 bg-white rounded-xl shadow-lg border border-secondary-200 py-2 z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-secondary-100">
                  <p className="text-sm font-medium text-secondary-900 truncate">{user?.user_metadata?.full_name || 'Usuario'}</p>
                  <p className="text-xs text-secondary-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/dashboard/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
                >
                  Configuración
                </Link>
                <hr className="my-1 border-secondary-100" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-danger-600 hover:bg-danger-50 transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-secondary-200 bg-white animate-fade-in">
          <nav className="px-4 py-3 space-y-1">
            {[
              { label: 'Resumen', href: '/dashboard' },
              { label: 'Productos', href: '/dashboard/products' },
              { label: 'Pedidos', href: '/dashboard/orders' },
              { label: 'Clientes', href: '/dashboard/customers' },
              { label: 'Plan', href: '/dashboard/plan' },
              { label: 'Configuración', href: '/dashboard/settings' },
            ].map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/dashboard'}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-secondary-600 hover:bg-secondary-50'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <hr className="border-secondary-200 my-2" />
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors"
            >
              Cerrar sesión
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}
