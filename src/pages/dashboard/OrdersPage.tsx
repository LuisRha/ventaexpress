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

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('¿Eliminar este pedido? Esta acción no se puede deshacer.')) return
    const { error: err } = await ordersService.deleteOrder(orderId)
    if (err) setError(err)
    else loadOrders()
  }

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
        <h1 className="text-2xl font-bold text-secondary-900">Pedidos</h1>
        <p className="text-secondary-500 mt-1">Gestiona los pedidos de tus clientes</p>
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
                : 'bg-white text-secondary-600 hover:bg-primary-50 border border-secondary-200'
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
            <Card key={order.id} className="cursor-pointer hover:border-primary-200 hover:shadow-md transition-all" onClick={() => setSelectedOrder(order)}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-secondary-900">#{order.orderNumber}</span>
                    <Badge variant={statusVariants[order.status] || 'secondary'}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-secondary-700">
                    {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Cliente'}
                  </p>
                  <p className="text-sm text-secondary-500">
                    {order.items?.map(i => `${i.quantity}x ${i.product?.name || 'Producto'}`).join(', ')}
                  </p>
                  <p className="text-xs text-secondary-400 mt-1">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-semibold text-secondary-900">{formatPrice(order.total)}</p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id) }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar pedido"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
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
