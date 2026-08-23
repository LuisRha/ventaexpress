import { supabase } from '@/lib/supabase'
import type { Plan, Subscription } from '@/types'

// ============================================
// SERVICIO DE PLANES Y SUSCRIPCIONES
// ============================================

export const plansService = {
  /**
   * Obtener todos los planes activos.
   */
  async getActivePlans(): Promise<{ plans: Plan[]; error: string | null }> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('active', true)
      .order('price', { ascending: true })

    if (error) return { plans: [], error: error.message }

    return {
      plans: (data || []).map(mapPlan),
      error: null,
    }
  },

  /**
   * Obtener suscripción activa del negocio.
   */
  async getActiveSubscription(businessId: string): Promise<{ subscription: Subscription | null; error: string | null }> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plans (*)')
      .eq('business_id', businessId)
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return { subscription: null, error: error.message }
    if (!data) return { subscription: null, error: null }

    return { subscription: mapSubscription(data), error: null }
  },

  /**
   * Obtener plan actual del negocio.
   */
  async getCurrentPlan(planId: string): Promise<{ plan: Plan | null; error: string | null }> {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error) return { plan: null, error: error.message }

    return { plan: mapPlan(data), error: null }
  },
}

function mapPlan(data: Record<string, unknown>): Plan {
  return {
    id: data.id as string,
    name: data.name as string,
    slug: data.slug as string,
    price: Number(data.price),
    currency: data.currency as string,
    billingPeriod: data.billing_period as Plan['billingPeriod'],
    maxProducts: data.max_products as number,
    maxImagesPerProduct: data.max_images_per_product as number,
    storageLimitMb: data.storage_limit_mb as number,
    features: (data.features as Record<string, boolean>) || {},
    active: data.active as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}

function mapSubscription(data: Record<string, unknown>): Subscription {
  return {
    id: data.id as string,
    businessId: data.business_id as string,
    planId: data.plan_id as string,
    provider: (data.provider as string) || null,
    providerCustomerId: (data.provider_customer_id as string) || null,
    providerSubscriptionId: (data.provider_subscription_id as string) || null,
    status: data.status as Subscription['status'],
    startDate: data.start_date as string,
    currentPeriodStart: (data.current_period_start as string) || null,
    currentPeriodEnd: (data.current_period_end as string) || null,
    cancelAtPeriodEnd: data.cancel_at_period_end as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    plan: data.plans ? mapPlan(data.plans as Record<string, unknown>) : undefined,
  }
}
