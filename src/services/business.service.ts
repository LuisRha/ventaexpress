import { supabase } from '@/lib/supabase'
import type { Business } from '@/types'

// ============================================
// TIPOS
// ============================================

export interface CreateBusinessData {
  name: string
  slug: string
  description?: string
  whatsappNumber?: string
}

export interface UpdateBusinessData {
  name?: string
  slug?: string
  description?: string | null
  whatsappNumber?: string | null
  logoUrl?: string | null
}

// ============================================
// SERVICIO DE NEGOCIOS
// ============================================

export const businessService = {
  /**
   * Obtener negocio del usuario actual.
   * Retorna null si aún no ha creado negocio.
   */
  async getMyBusiness(): Promise<{ business: Business | null; error: string | null }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { business: null, error: null }

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_user_id', session.user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (error) {
      console.warn('[getMyBusiness]', error.message)
      return { business: null, error: null }
    }

    if (!data) {
      return { business: null, error: null }
    }

    return { business: mapBusiness(data), error: null }
  },

  /**
   * Verificar si un slug está disponible.
   */
  async isSlugAvailable(slug: string): Promise<{ available: boolean; error: string | null }> {
    const { data, error } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      return { available: false, error: error.message }
    }

    return { available: data === null, error: null }
  },

  /**
   * Crear negocio para el usuario actual.
   * Asigna automáticamente el plan gratuito.
   */
  async createBusiness(input: CreateBusinessData): Promise<{ business: Business | null; error: string | null }> {
    // Obtener el plan FREE
    const { data: freePlan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('slug', 'free')
      .single()

    if (planError || !freePlan) {
      return { business: null, error: 'No se pudo obtener el plan gratuito.' }
    }

    // Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { business: null, error: 'No hay sesión activa.' }
    }

    // Crear negocio
    const { data, error } = await supabase
      .from('businesses')
      .insert({
        owner_user_id: user.id,
        name: input.name.trim(),
        slug: input.slug.toLowerCase().trim(),
        description: input.description?.trim() || null,
        whatsapp_number: input.whatsappNumber?.trim() || null,
        plan_id: freePlan.id,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && error.message.includes('slug')) {
        return { business: null, error: 'Esta URL ya está en uso. Elige otra.' }
      }
      if (error.code === '23505' && error.message.includes('owner')) {
        return { business: null, error: 'Ya tienes un negocio creado.' }
      }
      return { business: null, error: error.message }
    }

    return { business: mapBusiness(data), error: null }
  },

  /**
   * Actualizar negocio del usuario actual.
   */
  async updateBusiness(businessId: string, input: UpdateBusinessData): Promise<{ business: Business | null; error: string | null }> {
    const updateData: Record<string, unknown> = {}

    if (input.name !== undefined) updateData.name = input.name.trim()
    if (input.slug !== undefined) updateData.slug = input.slug.toLowerCase().trim()
    if (input.description !== undefined) updateData.description = input.description?.trim() || null
    if (input.whatsappNumber !== undefined) updateData.whatsapp_number = input.whatsappNumber?.trim() || null
    if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl

    const { data, error } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', businessId)
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && error.message.includes('slug')) {
        return { business: null, error: 'Esta URL ya está en uso. Elige otra.' }
      }
      return { business: null, error: error.message }
    }

    return { business: mapBusiness(data), error: null }
  },

  /**
   * Obtener el rol del usuario actual.
   */
  async getUserRole(): Promise<{ role: string | null; error: string | null }> {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return { role: 'seller', error: null }

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (error || !data) {
      return { role: 'seller', error: null }
    }

    return { role: data.role ?? 'seller', error: null }
  },
}

// ============================================
// MAPPER: snake_case → camelCase
// ============================================

function mapBusiness(data: Record<string, unknown>): Business {
  return {
    id: data.id as string,
    ownerUserId: data.owner_user_id as string,
    name: data.name as string,
    slug: data.slug as string,
    description: (data.description as string) || null,
    logoUrl: (data.logo_url as string) || null,
    whatsappNumber: (data.whatsapp_number as string) || null,
    status: data.status as Business['status'],
    planId: (data.plan_id as string) || null,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
