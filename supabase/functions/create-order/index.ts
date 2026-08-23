// ============================================
// EDGE FUNCTION: CREATE ORDER
// ============================================
// Esta función se ejecuta en el servidor con service_role.
// NUNCA confía en datos del frontend para precios o totales.
// Calcula todo desde la base de datos.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderRequest {
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

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const body: OrderRequest = await req.json()

    // ==========================================
    // VALIDACIONES
    // ==========================================

    if (!body.productId || !body.businessId || !body.firstName || !body.lastName || !body.phone || !body.province || !body.city || !body.address || !body.quantity) {
      return jsonResponse({ error: 'Faltan campos requeridos.' }, 400)
    }

    // Validar teléfono ecuatoriano
    if (!/^0[2-9][0-9]{8}$/.test(body.phone)) {
      return jsonResponse({ error: 'Número de teléfono no válido.' }, 400)
    }

    // Validar cantidad
    const quantity = Math.floor(body.quantity)
    if (quantity < 1 || quantity > 100) {
      return jsonResponse({ error: 'Cantidad no válida (1-100).' }, 400)
    }

    // ==========================================
    // VERIFICAR PRODUCTO
    // ==========================================

    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('id, business_id, price, status, stock, name')
      .eq('id', body.productId)
      .eq('business_id', body.businessId)
      .single()

    if (prodError || !product) {
      return jsonResponse({ error: 'Producto no encontrado.' }, 404)
    }

    if (product.status !== 'active') {
      return jsonResponse({ error: 'Este producto no está disponible.' }, 400)
    }

    // Verificar stock
    if (product.stock !== -1 && product.stock < quantity) {
      return jsonResponse({ error: 'No hay suficiente stock disponible.' }, 400)
    }

    // ==========================================
    // VERIFICAR BUSINESS ACTIVO
    // ==========================================

    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, status')
      .eq('id', body.businessId)
      .single()

    if (bizError || !business || business.status !== 'active') {
      return jsonResponse({ error: 'Negocio no disponible.' }, 400)
    }

    // ==========================================
    // CALCULAR PRECIOS (DESDE DB, NO FRONTEND)
    // ==========================================

    const unitPrice = Number(product.price)
    const subtotal = unitPrice * quantity
    const shippingCost = 0 // Se puede configurar por negocio en el futuro
    const total = subtotal + shippingCost

    // ==========================================
    // BUSCAR O CREAR CLIENTE
    // ==========================================

    let customerId: string

    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('business_id', body.businessId)
      .eq('phone', body.phone)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id

      // Actualizar datos del cliente (pueden haber cambiado dirección)
      await supabase
        .from('customers')
        .update({
          first_name: body.firstName.trim(),
          second_name: body.secondName?.trim() || null,
          last_name: body.lastName.trim(),
          second_last_name: body.secondLastName?.trim() || null,
          province: body.province,
          city: body.city.trim(),
          address: body.address.trim(),
          reference: body.reference?.trim() || null,
        })
        .eq('id', customerId)
    } else {
      const { data: newCustomer, error: custError } = await supabase
        .from('customers')
        .insert({
          business_id: body.businessId,
          first_name: body.firstName.trim(),
          second_name: body.secondName?.trim() || null,
          last_name: body.lastName.trim(),
          second_last_name: body.secondLastName?.trim() || null,
          phone: body.phone,
          province: body.province,
          city: body.city.trim(),
          address: body.address.trim(),
          reference: body.reference?.trim() || null,
        })
        .select('id')
        .single()

      if (custError || !newCustomer) {
        return jsonResponse({ error: 'Error registrando datos del cliente.' }, 500)
      }

      customerId = newCustomer.id
    }

    // ==========================================
    // CREAR PEDIDO
    // ==========================================

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        business_id: body.businessId,
        customer_id: customerId,
        status: 'PENDING',
        payment_method: 'COD',
        subtotal,
        shipping_cost: shippingCost,
        total,
        customer_notes: body.customerNotes?.trim() || null,
      })
      .select('id, order_number')
      .single()

    if (orderError || !order) {
      return jsonResponse({ error: 'Error creando el pedido.' }, 500)
    }

    // ==========================================
    // CREAR ORDER ITEMS
    // ==========================================

    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: body.productId,
        quantity,
        unit_price: unitPrice,
        total: subtotal,
      })

    if (itemError) {
      // Rollback: eliminar el pedido creado
      await supabase.from('orders').delete().eq('id', order.id)
      return jsonResponse({ error: 'Error procesando el pedido.' }, 500)
    }

    // ==========================================
    // ACTUALIZAR STOCK (si no es ilimitado)
    // ==========================================

    if (product.stock !== -1) {
      await supabase
        .from('products')
        .update({ stock: product.stock - quantity })
        .eq('id', product.id)
    }

    // ==========================================
    // AUDIT LOG
    // ==========================================

    await supabase.from('audit_logs').insert({
      business_id: body.businessId,
      action: 'order_created',
      entity_type: 'order',
      entity_id: order.id,
      metadata: {
        order_number: order.order_number,
        product_name: product.name,
        quantity,
        total,
        customer_phone: body.phone,
      },
    })

    // ==========================================
    // RESPUESTA
    // ==========================================

    return jsonResponse({ orderNumber: order.order_number, orderId: order.id })

  } catch (err) {
    console.error('Error in create-order:', err)
    return jsonResponse({ error: 'Error interno del servidor.' }, 500)
  }
})

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
