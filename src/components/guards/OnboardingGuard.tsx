import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingPage } from '@/components/shared/LoadingPage'

/**
 * Guard que verifica si el usuario ya tiene un negocio creado.
 * - Si tiene negocio → permite acceder al dashboard.
 * - Si NO tiene negocio → redirige a la página de onboarding.
 */
export function OnboardingGuard() {
  const { isLoading, hasBusiness, isAdmin } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  // CEO/Admin no necesita crear negocio para acceder al dashboard
  if (isAdmin) {
    return <Outlet />
  }

  if (!hasBusiness) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
