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

  const generateWhatsAppConfirmation = (order: Order) => {
    const customerName = order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Cliente'
    const phone = order.customer?.phone || ''
    const intlPhone = phone.startsWith('0') ? `593${phone.slice(1)}` : phone
    const items = order.items?.map(i => `${i.quantity}x ${i.product?.name || 'Producto'}`).join(', ') || ''

    const message = `Hola ${customerName}, su pedido #${order.orderNumber} (${items}) por ${formatPrice(order.total)} fue registrado exitosamente.\n\nPara despachar su producto necesitamos que confirme su compra. Los pedidos no confirmados serán cancelados automáticamente ya que la logística y envío generan costos.\n\n¿Está seguro de realizar esta compra? Responda SÍ o NO.\n\n¡Gracias por su preferencia!`

    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`
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
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-secondary-900">{formatPrice(order.total)}</p>
                  <a
                    href={generateWhatsAppConfirmation(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Confirmar por WhatsApp"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </a>
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
