import { supabase } from '@/lib/supabase'
import type { Order, OrderStatus } from '@/types'

// ============================================
// TIPOS
// ============================================

export interface CreateOrderData {
  productId: string
  businessId: string
  firstName: string
  secondName?: string
  lastName: string
  secondLastName?: string
  phone: string
  province: string
  city: string
  address: string
  reference?: string
  quantity: number
  customerNotes?: string
}

// ============================================
// SERVICIO DE PEDIDOS
// ============================================

export const ordersService = {
  /**
   * Crear pedido público (llamada a Edge Function).
   * IMPORTANTE: El precio se calcula en backend, no confiamos en frontend.
   */
  async createOrder(data: CreateOrderData): Promise<{ orderNumber: number | null; error: string | null }> {
    const { data: result, error } = await supabase.functions.invoke('create-order', {
      body: data,
    })

    if (error) {
      return { orderNumber: null, error: 'No se pudo crear el pedido. Intenta nuevamente.' }
    }

    if (result?.error) {
      return { orderNumber: null, error: result.error }
    }

    return { orderNumber: result?.orderNumber ?? null, error: null }
  },

  /**
   * Obtener pedidos del negocio (dashboard del vendedor).
   */
  async getOrders(businessId: string, status?: string): Promise<{ orders: Order[]; error: string | null }> {
    let query = supabase
      .from('orders')
      .select(`
        *,
        customers (id, first_name, last_name, phone, city),
        order_items (id, product_id, quantity, unit_price, total, products (name))
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      return { orders: [], error: error.message }
    }

    return { orders: (data || []).map(mapOrder), error: null }
  },

  /**
   * Obtener un pedido por ID.
   */
  async getOrderById(orderId: string): Promise<{ order: Order | null; error: string | null }> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (id, first_name, second_name, last_name, second_last_name, phone, province, city, address, reference),
        order_items (id, product_id, quantity, unit_price, total, products (name, slug))
      `)
      .eq('id', orderId)
      .single()

    if (error) {
      return { order: null, error: error.message }
    }

    return { order: mapOrder(data), error: null }
  },

  /**
   * Actualizar estado de un pedido.
   */
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  /**
   * Obtener conteos de pedidos por estado.
   */
  async getOrderCounts(businessId: string): Promise<Record<string, number>> {
    const statuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
    const counts: Record<string, number> = {}

    for (const status of statuses) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('status', status)

      counts[status] = count || 0
    }

    return counts
  },
}

// ============================================
// MAPPER
// ============================================

function mapOrder(data: Record<string, unknown>): Order {
  const customer = data.customers as Record<string, unknown> | null
  const items = (data.order_items as Record<string, unknown>[]) || []

  return {
    id: data.id as string,
    businessId: data.business_id as string,
    customerId: data.customer_id as string,
    orderNumber: data.order_number as number,
    status: data.status as OrderStatus,
    paymentMethod: data.payment_method as Order['paymentMethod'],
    subtotal: Number(data.subtotal),
    shippingCost: Number(data.shipping_cost),
    total: Number(data.total),
    customerNotes: (data.customer_notes as string) || null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    customer: customer ? {
      id: customer.id as string,
      businessId: '',
      firstName: customer.first_name as string,
      secondName: (customer.second_name as string) || null,
      lastName: customer.last_name as string,
      secondLastName: (customer.second_last_name as string) || null,
      phone: customer.phone as string,
      province: (customer.province as string) || '',
      city: (customer.city as string) || '',
      address: (customer.address as string) || '',
      reference: (customer.reference as string) || null,
      createdAt: '',
      updatedAt: '',
    } : undefined,
    items: items.map((item) => ({
      id: item.id as string,
      orderId: data.id as string,
      productId: item.product_id as string,
      quantity: item.quantity as number,
      unitPrice: Number(item.unit_price),
      total: Number(item.total),
      product: item.products ? {
        id: item.product_id as string,
        businessId: '',
        name: (item.products as Record<string, unknown>).name as string,
        slug: ((item.products as Record<string, unknown>).slug as string) || '',
        description: null,
        benefits: null,
        price: Number(item.unit_price),
        previousPrice: null,
        stock: 0,
        deliveryInfo: null,
        paymentInfo: null,
        status: 'active' as const,
        createdAt: '',
        updatedAt: '',
      } : undefined,
    })),
  }
}
