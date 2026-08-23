import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingPage } from '@/components/shared/LoadingPage'

/**
 * Guard para el dashboard:
 * - Admin sin negocio → redirige a /admin
 * - Vendedor sin negocio → redirige a /onboarding
 * - Vendedor con negocio → permite pasar
 */
export function OnboardingGuard() {
  const { isLoading, hasBusiness, isAdmin } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  // CEO/Admin va directo a /admin
  if (isAdmin && !hasBusiness) {
    return <Navigate to="/admin" replace />
  }

  if (!hasBusiness) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
