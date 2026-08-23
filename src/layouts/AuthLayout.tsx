import { Outlet, Link } from 'react-router-dom'
import { APP_NAME } from '@/utils/constants'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary-50 px-4 py-8">
      {/* Logo */}
      <Link to="/" className="mb-8 flex items-center gap-2">
        <div className="h-10 w-10 rounded-xl bg-primary-600 flex items-center justify-center">
          <span className="text-white font-bold">VE</span>
        </div>
        <span className="font-semibold text-xl text-secondary-900">{APP_NAME}</span>
      </Link>

      {/* Auth card */}
      <div className="w-full max-w-sm bg-white rounded-xl border border-secondary-200 shadow-sm p-6 sm:p-8">
        <Outlet />
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-secondary-500">
        &copy; {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.
      </p>
    </div>
  )
}
