import { Outlet } from 'react-router-dom'
import { DashboardNavbar } from '@/components/layout/DashboardNavbar'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-100 to-indigo-100">
      <DashboardNavbar />
      <DashboardSidebar />
      <main className="lg:pl-64 pt-0">
        <div className="container-app py-0">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
