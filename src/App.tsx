import { Routes, Route } from 'react-router-dom'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute, PublicOnlyRoute, AdminRoute, OnboardingGuard } from '@/components/guards'

// Pages — Public
import { LandingPage } from '@/pages/public/LandingPage'
import { ProductPage } from '@/pages/public/ProductPage'

// Pages — Auth
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

// Pages — Onboarding
import { CreateBusinessPage } from '@/pages/dashboard/CreateBusinessPage'

// Pages — Dashboard
import { DashboardHome } from '@/pages/dashboard/DashboardHome'
import { ProductsPage } from '@/pages/dashboard/ProductsPage'
import { ProductNewPage } from '@/pages/dashboard/ProductNewPage'
import { ProductEditPage } from '@/pages/dashboard/ProductEditPage'
import { OrdersPage } from '@/pages/dashboard/OrdersPage'
import { CustomersPage } from '@/pages/dashboard/CustomersPage'
import { PlanPage } from '@/pages/dashboard/PlanPage'
import { SettingsPage } from '@/pages/dashboard/SettingsPage'

// Pages — Admin
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminBusinesses } from '@/pages/admin/AdminBusinesses'
import { AdminLogs } from '@/pages/admin/AdminLogs'

export function App() {
  return (
    <Routes>
      {/* ==========================================
          RUTAS PÚBLICAS (sin restricción)
          ========================================== */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      {/* ==========================================
          RUTAS AUTH (solo si NO está logueado)
          ========================================== */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
      </Route>

      {/* ==========================================
          ONBOARDING (autenticado pero sin negocio)
          ========================================== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<CreateBusinessPage />} />
      </Route>

      {/* ==========================================
          RUTAS PROTEGIDAS (requiere sesión + negocio)
          ========================================== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<OnboardingGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/dashboard/products" element={<ProductsPage />} />
            <Route path="/dashboard/products/new" element={<ProductNewPage />} />
            <Route path="/dashboard/products/:productId/edit" element={<ProductEditPage />} />
            <Route path="/dashboard/orders" element={<OrdersPage />} />
            <Route path="/dashboard/customers" element={<CustomersPage />} />
            <Route path="/dashboard/plan" element={<PlanPage />} />
            <Route path="/dashboard/settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* ==========================================
          RUTAS ADMIN (requiere sesión + role admin)
          ========================================== */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/businesses" element={<AdminBusinesses />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
        </Route>
      </Route>

      {/* ==========================================
          PÁGINA PÚBLICA DE PRODUCTO (catch-all)
          Debe estar al final para no interceptar otras rutas.
          ========================================== */}
      <Route path="/:businessSlug/:productSlug" element={<ProductPage />} />
    </Routes>
  )
}
