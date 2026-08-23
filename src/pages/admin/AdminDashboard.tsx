import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { adminService } from '@/services/admin.service'
import { formatPrice } from '@/utils/format'

export function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const data = await adminService.getStats()
      setStats(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner className="py-12" />

  const statCards = [
    { label: 'Usuarios', value: stats?.totalUsers || 0, icon: '👥', color: 'from-blue-500 to-blue-600', href: '/admin/users' },
    { label: 'Negocios', value: stats?.totalBusinesses || 0, icon: '🏪', color: 'from-purple-500 to-purple-600', href: '/admin/businesses' },
    { label: 'Productos', value: stats?.totalProducts || 0, icon: '📦', color: 'from-amber-500 to-amber-600', href: '/admin/businesses' },
    { label: 'Pedidos', value: stats?.totalOrders || 0, icon: '🛒', color: 'from-green-500 to-green-600', href: '/admin/businesses' },
    { label: 'Ingresos', value: formatPrice(stats?.totalRevenue || 0), icon: '💰', color: 'from-emerald-500 to-emerald-600', href: '/admin/payments' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
        <p className="text-secondary-400 mt-1">Vista general de la plataforma VentaExpress</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => (
          <Link to={stat.href} key={stat.label}>
            <div className={`bg-gradient-to-br ${stat.color} rounded-xl p-5 text-white hover:scale-105 transition-transform shadow-lg`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-white/80">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-secondary-900 mb-4">Acciones rápidas</h3>
          <div className="space-y-2">
            <Link to="/admin/users">
              <Button variant="outline" fullWidth className="justify-start">
                👥 Gestionar usuarios
              </Button>
            </Link>
            <Link to="/admin/businesses">
              <Button variant="outline" fullWidth className="justify-start">
                🏪 Ver negocios
              </Button>
            </Link>
            <Link to="/admin/plans">
              <Button variant="outline" fullWidth className="justify-start">
                💎 Configurar planes
              </Button>
            </Link>
            <Link to="/admin/logs">
              <Button variant="outline" fullWidth className="justify-start">
                📋 Ver logs de auditoría
              </Button>
            </Link>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-secondary-900 mb-4">Estado del sistema</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-secondary-100">
              <span className="text-sm text-secondary-600">Plataforma</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                Operativa
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-secondary-100">
              <span className="text-sm text-secondary-600">Base de datos</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Conectada
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-secondary-100">
              <span className="text-sm text-secondary-600">Pasarela de pagos</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-yellow-600">
                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                Pendiente
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-secondary-600">Storage</span>
              <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                Activo
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
