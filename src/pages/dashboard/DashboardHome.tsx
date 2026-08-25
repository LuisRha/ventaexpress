import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
    <div className="py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">¡Hola! 👋</h1>
          <p className="text-secondary-500">{business?.name}</p>
        </div>
        <Link to="/dashboard/products/new">
          <Button className="bg-gradient-to-r from-primary-600 to-primary-700 shadow-lg shadow-primary-500/25">
            + Nuevo producto
          </Button>
        </Link>
      </div>

      {/* Stats con gradientes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-500/25">
          <p className="text-blue-100 text-sm">Productos</p>
          <p className="text-3xl font-bold mt-1">{limits ? `${limits.currentProducts}/${limits.maxProducts}` : '—'}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/25">
          <p className="text-amber-100 text-sm">Pendientes</p>
          <p className="text-3xl font-bold mt-1">{orderCounts.PENDING || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-purple-500/25">
          <p className="text-purple-100 text-sm">Confirmados</p>
          <p className="text-3xl font-bold mt-1">{orderCounts.CONFIRMED || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-500/25">
          <p className="text-emerald-100 text-sm">Entregados</p>
          <p className="text-3xl font-bold mt-1">{orderCounts.DELIVERED || 0}</p>
        </div>
      </div>

      {/* Cards de acción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-secondary-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                <span className="text-xl">📦</span>
              </div>
              <p className="font-semibold text-secondary-900">Pedidos totales</p>
              <p className="text-sm text-secondary-500">{totalOrders} pedidos recibidos</p>
            </div>
            <Link to="/dashboard/orders">
              <Button variant="outline" size="sm">Ver</Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-secondary-200 p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                <span className="text-xl">🔗</span>
              </div>
              <p className="font-semibold text-secondary-900">Tu enlace</p>
              <p className="text-sm text-secondary-500 truncate max-w-[200px]">
                ventaxpres.com/{business?.slug}
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://www.ventaxpres.com/${business?.slug}`)
              }}
              className="text-sm text-primary-600 font-medium hover:text-primary-700"
            >
              Copiar
            </button>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl border border-primary-100 p-5">
        <h3 className="font-semibold text-secondary-900 mb-2">💡 Tips para vender más</h3>
        <ul className="space-y-2 text-sm text-secondary-600">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500"></span>
            Sube fotos de buena calidad de tus productos
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500"></span>
            Comparte tu enlace en TikTok, Facebook e Instagram
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500"></span>
            Responde rápido los pedidos por WhatsApp
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500"></span>
            Agrega precio anterior para mostrar descuentos
          </li>
        </ul>
      </div>
    </div>
  )
}
