import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { useAuth } from '@/contexts/AuthContext'
import { productsService, type ProductLimits } from '@/services/products.service'
import { ordersService } from '@/services/orders.service'

export function DashboardHome() {
  const { business } = useAuth()
  const [limits, setLimits] = useState<ProductLimits | null>(null)
  const [orderCounts, setOrderCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!business) return
    const load = async () => {
      const [limitsResult, counts] = await Promise.all([
        productsService.getProductLimits(business.id),
        ordersService.getOrderCounts(business.id),
      ])
      setLimits(limitsResult.limits)
      setOrderCounts(counts)
      setLoading(false)
    }
    load()
  }, [business])

  if (loading) return <LoadingSpinner className="py-12" />

  const totalOrders = Object.values(orderCounts).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Resumen</h1>
          <p className="text-secondary-500 mt-1">{business?.name}</p>
        </div>
        <Link to="/dashboard/products/new">
          <Button size="sm">Nuevo producto</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card padding="sm">
          <p className="text-sm text-secondary-500 mb-1">Productos</p>
          <p className="text-2xl font-bold text-secondary-900">
            {limits ? `${limits.currentProducts} / ${limits.maxProducts}` : '—'}
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-secondary-500 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-warning-600">{orderCounts.PENDING || 0}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-secondary-500 mb-1">Confirmados</p>
          <p className="text-2xl font-bold text-primary-600">{orderCounts.CONFIRMED || 0}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-secondary-500 mb-1">Entregados</p>
          <p className="text-2xl font-bold text-success-600">{orderCounts.DELIVERED || 0}</p>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-secondary-900">Pedidos totales</p>
              <p className="text-sm text-secondary-500">{totalOrders} pedidos recibidos</p>
            </div>
            <Link to="/dashboard/orders">
              <Button variant="outline" size="sm">Ver pedidos</Button>
            </Link>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-secondary-900">Tu enlace</p>
              <p className="text-sm text-secondary-500 truncate">
                {window.location.origin}/{business?.slug}
              </p>
            </div>
            <Badge variant="success">Activo</Badge>
          </div>
        </Card>
      </div>
    </div>
  )
}
