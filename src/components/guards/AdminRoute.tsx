import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingPage } from '@/components/shared/LoadingPage'

/**
 * Guard para rutas de administrador.
 * Requiere:
 * 1. Sesión activa (autenticación)
 * 2. role = 'admin' (autorización)
 * 
 * Un usuario normal que intente acceder a /admin será redirigido al dashboard.
 */
export function AdminRoute() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    // Usuario autenticado pero no es admin → dashboard
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
