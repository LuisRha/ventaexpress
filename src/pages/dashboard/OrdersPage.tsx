import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/contexts/AuthContext'
import { ordersService } from '@/services/orders.service'
import type { Order, OrderStatus } from '@/types'
import { formatPrice, formatDateTime } from '@/utils/format'
import { ORDER_STATUS_LABELS } from '@/utils/constants'

const statusVariants: Record<string, 'warning' | 'primary' | 'success' | 'danger' | 'secondary'> = {
  PENDING: 'warning',
  CONFIRMATION_PENDING: 'warning',
  CONFIRMED: 'primary',
  SHIPPED: 'primary',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REJECTED: 'danger',
}

const filterOptions = [
  { value: '', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'CONFIRMED', label: 'Confirmados' },
  { value: 'SHIPPED', label: 'Enviados' },
  { value: 'DELIVERED', label: 'Entregados' },
  { value: 'CANCELLED', label: 'Cancelados' },
]

export function OrdersPage() {
  const { business } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const loadOrders = useCallback(async () => {
    if (!business) return
    setLoading(true)
    const { orders: data, error: err } = await ordersService.getOrders(business.id, filter || undefined)
    if (err) setError(err)
    else setOrders(data)
    setLoading(false)
  }, [business, filter])

  useEffect(() => { loadOrders() }, [loadOrders])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const { error: err } = await ordersService.updateOrderStatus(orderId, newStatus)
    if (err) {
      setError(err)
    } else {
      loadOrders()
      setSelectedOrder(null)
    }
  }

  const generateWhatsAppLink = (order: Order) => {
    if (!business?.whatsappNumber || !order.customer) return null
    const phone = `593${business.whatsappNumber.slice(1)}`
    const items = order.items?.map(i => `${i.quantity}x ${i.product?.name}`).join(', ') || ''
    const msg = `Hola ${order.customer.firstName} ${order.customer.lastName}, recibimos su pedido #${order.orderNumber} (${items}) por ${formatPrice(order.total)} con pago contra entrega. ¿Confirma su pedido?`
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
  }

  if (loading) return <LoadingSpinner className="py-12" />

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Pedidos</h1>
        <p className="text-slate-400 mt-1">Gestiona los pedidos de tus clientes</p>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors ${
              filter === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState title="Sin pedidos" description={filter ? 'No hay pedidos con este filtro.' : 'Cuando recibas tu primer pedido aparecerá aquí.'} />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setSelectedOrder(order)}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">#{order.orderNumber}</span>
                    <Badge variant={statusVariants[order.status] || 'secondary'}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-300">
                    {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Cliente'}
                  </p>
                  <p className="text-sm text-slate-400">
                    {order.items?.map(i => `${i.quantity}x ${i.product?.name || 'Producto'}`).join(', ')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold text-white">{formatPrice(order.total)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Pedido #${selectedOrder.orderNumber}`} size="lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={statusVariants[selectedOrder.status] || 'secondary'} size="md">
                {ORDER_STATUS_LABELS[selectedOrder.status]}
              </Badge>
              <span className="text-sm text-secondary-500">{formatDateTime(selectedOrder.createdAt)}</span>
            </div>

            {/* Customer info */}
            {selectedOrder.customer && (
              <div className="bg-secondary-50 rounded-lg p-3">
                <p className="font-medium text-secondary-900">
                  {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                </p>
                <p className="text-sm text-secondary-600">{selectedOrder.customer.phone}</p>
                <p className="text-sm text-secondary-600">
                  {selectedOrder.customer.city}, {selectedOrder.customer.province}
                </p>
                <p className="text-sm text-secondary-600">{selectedOrder.customer.address}</p>
                {selectedOrder.customer.reference && (
                  <p className="text-sm text-secondary-500">Ref: {selectedOrder.customer.reference}</p>
                )}
              </div>
            )}

            {/* Items */}
            <div>
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between text-sm py-1">
                  <span>{item.quantity}x {item.product?.name || 'Producto'}</span>
                  <span className="font-medium">{formatPrice(item.total)}</span>
                </div>
              ))}
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {selectedOrder.customerNotes && (
              <p className="text-sm text-secondary-600 bg-warning-50 p-2 rounded">
                Nota: {selectedOrder.customerNotes}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-secondary-200">
              {selectedOrder.status === 'PENDING' && (
                <>
                  <Button size="sm" onClick={() => handleStatusChange(selectedOrder.id, 'CONFIRMED')}>Confirmar</Button>
                  <Button size="sm" variant="danger" onClick={() => handleStatusChange(selectedOrder.id, 'CANCELLED')}>Cancelar</Button>
                </>
              )}
              {selectedOrder.status === 'CONFIRMED' && (
                <Button size="sm" onClick={() => handleStatusChange(selectedOrder.id, 'SHIPPED')}>Marcar enviado</Button>
              )}
              {selectedOrder.status === 'SHIPPED' && (
                <Button size="sm" onClick={() => handleStatusChange(selectedOrder.id, 'DELIVERED')}>Marcar entregado</Button>
              )}
              {(() => {
                const waLink = generateWhatsAppLink(selectedOrder)
                return waLink ? (
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                      WhatsApp
                    </Button>
                  </a>
                ) : null
              })()}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
