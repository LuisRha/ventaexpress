import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingPage } from '@/components/shared/LoadingPage'

/**
 * Guard para rutas protegidas (requieren autenticación).
 * Redirige a /login si no hay sesión.
 * Muestra loading mientras verifica el estado de auth.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated) {
    // Guardar la ruta intentada para redirect después del login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
