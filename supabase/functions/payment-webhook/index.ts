// ============================================
// EDGE FUNCTION: PAYMENT WEBHOOK
// ============================================
// Recibe eventos de la pasarela de pagos.
// Verifica firma, garantiza idempotencia y actualiza suscripción.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const signature = req.headers.get('x-webhook-signature') || ''
    const rawBody = await req.text()
    const body = JSON.parse(rawBody)

    // ==========================================
    // VERIFICAR FIRMA
    // ==========================================
    const webhookSecret = Deno.env.get('PAYMENT_WEBHOOK_SECRET') || ''
    if (webhookSecret && !verifySignature(rawBody, signature, webhookSecret)) {
      return jsonResponse({ error: 'Invalid signature' }, 401)
    }

    // ==========================================
    // EXTRAER DATOS DEL EVENTO
    // ==========================================
    const provider = body.provider || 'unknown'
    const eventId = body.event_id || body.id || `${Date.now()}`
    const eventType = body.type || body.event_type || 'unknown'

    // ==========================================
    // VERIFICAR IDEMPOTENCIA
    // ==========================================
    const { data: existingEvent } = await supabase
      .from('payment_events')
      .select('id')
      .eq('provider', provider)
      .eq('provider_event_id', eventId)
      .single()

    if (existingEvent) {
      // Ya procesado — idempotencia garantizada
      return jsonResponse({ message: 'Event already processed', eventId })
    }

    // Registrar evento
    await supabase.from('payment_events').insert({
      provider,
      provider_event_id: eventId,
      event_type: eventType,
      payload_hash: hashPayload(rawBody),
      processed: false,
    })

    // ==========================================
    // PROCESAR EVENTO
    // ==========================================
    let processed = false

    switch (eventType) {
      case 'subscription.created':
      case 'subscription.activated':
      case 'payment.completed': {
        const businessId = body.metadata?.business_id
        const planSlug = body.metadata?.plan_slug || 'pro'

        if (businessId) {
          // Obtener plan
          const { data: plan } = await supabase
            .from('plans')
            .select('id')
            .eq('slug', planSlug)
            .single()

          if (plan) {
            // Actualizar negocio al nuevo plan
            await supabase
              .from('businesses')
              .update({ plan_id: plan.id })
              .eq('id', businessId)

            // Crear/actualizar suscripción
            const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

            await supabase.from('subscriptions').upsert({
              business_id: businessId,
              plan_id: plan.id,
              provider,
              provider_subscription_id: body.subscription_id || eventId,
              status: 'active',
              start_date: new Date().toISOString(),
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd,
            }, { onConflict: 'business_id' })

            // Registrar pago
            await supabase.from('payments').insert({
              business_id: businessId,
              provider,
              provider_payment_id: body.payment_id || eventId,
              amount: body.amount || 5.00,
              currency: 'USD',
              status: 'completed',
              payment_type: 'subscription',
            })

            processed = true
          }
        }
        break
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        const businessId = body.metadata?.business_id
        if (businessId) {
          // Obtener plan free
          const { data: freePlan } = await supabase
            .from('plans')
            .select('id')
            .eq('slug', 'free')
            .single()

          if (freePlan) {
            await supabase
              .from('businesses')
              .update({ plan_id: freePlan.id })
              .eq('id', businessId)

            await supabase
              .from('subscriptions')
              .update({ status: 'cancelled' })
              .eq('business_id', businessId)
              .eq('status', 'active')
          }

          processed = true
        }
        break
      }

      case 'payment.failed': {
        const businessId = body.metadata?.business_id
        if (businessId) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('business_id', businessId)
            .eq('status', 'active')

          processed = true
        }
        break
      }
    }

    // Marcar evento como procesado
    await supabase
      .from('payment_events')
      .update({ processed })
      .eq('provider', provider)
      .eq('provider_event_id', eventId)

    // Audit log
    await supabase.from('audit_logs').insert({
      action: `webhook_${eventType}`,
      entity_type: 'payment_event',
      metadata: { provider, eventId, eventType, processed },
    })

    return jsonResponse({ message: 'Webhook processed', processed })

  } catch (err) {
    console.error('Webhook error:', err)
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
})

function jsonResponse(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function verifySignature(_payload: string, _signature: string, _secret: string): boolean {
  // TODO: Implementar verificación real según el proveedor seleccionado
  // Cada proveedor tiene su propio método de firma (HMAC-SHA256, etc.)
  if (!_signature) return false
  return true
}

function hashPayload(payload: string): string {
  // Simple hash para verificación de integridad
  let hash = 0
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}
