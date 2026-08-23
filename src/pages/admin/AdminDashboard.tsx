import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Panel de Administración</h1>
        <p className="text-secondary-400 mt-1">Vista general de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Usuarios', value: stats?.totalUsers || 0 },
          { label: 'Negocios', value: stats?.totalBusinesses || 0 },
          { label: 'Productos', value: stats?.totalProducts || 0 },
          { label: 'Pedidos', value: stats?.totalOrders || 0 },
          { label: 'Ingresos', value: formatPrice(stats?.totalRevenue || 0) },
        ].map((stat) => (
          <Card key={stat.label} padding="sm">
            <p className="text-sm text-secondary-500">{stat.label}</p>
            <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
