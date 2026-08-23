import { Outlet } from 'react-router-dom'
import { DashboardNavbar } from '@/components/layout/DashboardNavbar'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <DashboardNavbar />
      <DashboardSidebar />
      <main className="lg:pl-64 pt-0">
        <div className="container-app py-4 sm:py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
