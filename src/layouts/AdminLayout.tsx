import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { APP_NAME } from '@/utils/constants'
import { useAuth } from '@/contexts/AuthContext'

const adminNavItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Usuarios', href: '/admin/users' },
  { label: 'Negocios', href: '/admin/businesses' },
  { label: 'Mensajes', href: '/admin/messages' },
  { label: 'Planes', href: '/admin/plans' },
  { label: 'Pagos', href: '/admin/payments' },
  { label: 'Logs', href: '/admin/logs' },
]

export function AdminLayout() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-secondary-900">
      {/* Admin navbar */}
      <header className="sticky top-0 z-40 border-b border-secondary-700 bg-secondary-900">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-7 w-7 rounded bg-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">VE</span>
              </div>
              <span className="font-medium text-white text-sm">
                {APP_NAME} <span className="text-secondary-400">Admin</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-danger-400 hover:text-danger-300 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="px-4 sm:px-6 flex gap-1 overflow-x-auto scrollbar-hide">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/admin'}
              className={({ isActive }) =>
                cn(
                  'px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
                  isActive
                    ? 'border-primary-500 text-white'
                    : 'border-transparent text-secondary-400 hover:text-secondary-200'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  )
}
