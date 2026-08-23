import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingPage } from '@/components/shared/LoadingPage'

/**
 * Guard para rutas de administrador.
 * Espera a que se carguen todos los datos (sesión + rol + negocio)
 * antes de decidir si redirigir.
 */
export function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  // IMPORTANTE: No redirigir hasta que TODO esté cargado
  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
