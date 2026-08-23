import { supabase } from '@/lib/supabase'
import type { Product, ProductImage } from '@/types'

// ============================================
// TIPOS
// ============================================

export interface CreateProductData {
  name: string
  slug: string
  description?: string
  benefits?: string
  price: number
  previousPrice?: number | null
  stock?: number
  deliveryInfo?: string
  paymentInfo?: string
}

export interface UpdateProductData {
  name?: string
  slug?: string
  description?: string | null
  benefits?: string | null
  price?: number
  previousPrice?: number | null
  stock?: number
  deliveryInfo?: string | null
  paymentInfo?: string | null
  status?: 'active' | 'inactive'
}

export interface ProductLimits {
  maxProducts: number
  currentProducts: number
  canCreate: boolean
  maxImagesPerProduct: number
}

// ============================================
// SERVICIO DE PRODUCTOS
// ============================================

export const productsService = {
  /**
   * Obtener todos los productos del negocio actual.
   */
  async getProducts(businessId: string): Promise<{ products: Product[]; error: string | null }> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (id, public_url, sort_order)
      `)
      .eq('business_id', businessId)
      .neq('status', 'deleted')
      .order('created_at', { ascending: false })

    if (error) {
      return { products: [], error: error.message }
    }

    return { products: (data || []).map(mapProduct), error: null }
  },

  /**
   * Obtener un producto por ID.
   */
  async getProductById(productId: string): Promise<{ product: Product | null; error: string | null }> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (id, product_id, storage_path, public_url, sort_order, created_at)
      `)
      .eq('id', productId)
      .single()

    if (error) {
      return { product: null, error: error.message }
    }

    return { product: mapProduct(data), error: null }
  },

  /**
   * Obtener límites de productos según el plan del negocio.
   */
  async getProductLimits(businessId: string): Promise<{ limits: ProductLimits | null; error: string | null }> {
    // Obtener plan del negocio
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('plan_id')
      .eq('id', businessId)
      .single()

    if (bizError || !business?.plan_id) {
      return { limits: null, error: 'No se pudo obtener la información del negocio.' }
    }

    // Obtener límites del plan
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('max_products, max_images_per_product')
      .eq('id', business.plan_id)
      .single()

    if (planError || !plan) {
      return { limits: null, error: 'No se pudo obtener el plan.' }
    }

    // Contar productos actuales (no eliminados)
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .neq('status', 'deleted')

    if (countError) {
      return { limits: null, error: 'No se pudo contar los productos.' }
    }

    const currentProducts = count || 0
    const maxProducts = plan.max_products

    return {
      limits: {
        maxProducts,
        currentProducts,
        canCreate: currentProducts < maxProducts,
        maxImagesPerProduct: plan.max_images_per_product,
      },
      error: null,
    }
  },

  /**
   * Crear un nuevo producto.
   * Valida límite del plan antes de crear.
   */
  async createProduct(businessId: string, input: CreateProductData): Promise<{ product: Product | null; error: string | null }> {
    // Verificar límite
    const { limits, error: limitsError } = await this.getProductLimits(businessId)
    if (limitsError || !limits) {
      return { product: null, error: limitsError || 'Error verificando límites.' }
    }

    if (!limits.canCreate) {
      return {
        product: null,
        error: `Has alcanzado el límite de ${limits.maxProducts} productos de tu plan. Actualiza a PRO para crear más.`,
      }
    }

    // Crear producto
    const { data, error } = await supabase
      .from('products')
      .insert({
        business_id: businessId,
        name: input.name.trim(),
        slug: input.slug.toLowerCase().trim(),
        description: input.description?.trim() || null,
        benefits: input.benefits?.trim() || null,
        price: input.price,
        previous_price: input.previousPrice ?? null,
        stock: input.stock ?? -1,
        delivery_info: input.deliveryInfo?.trim() || null,
        payment_info: input.paymentInfo?.trim() || null,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && error.message.includes('slug')) {
        return { product: null, error: 'Ya tienes un producto con esta URL. Elige otra.' }
      }
      return { product: null, error: error.message }
    }

    return { product: mapProduct(data), error: null }
  },

  /**
   * Actualizar un producto existente.
   */
  async updateProduct(productId: string, input: UpdateProductData): Promise<{ product: Product | null; error: string | null }> {
    const updateData: Record<string, unknown> = {}

    if (input.name !== undefined) updateData.name = input.name.trim()
    if (input.slug !== undefined) updateData.slug = input.slug.toLowerCase().trim()
    if (input.description !== undefined) updateData.description = input.description?.trim() || null
    if (input.benefits !== undefined) updateData.benefits = input.benefits?.trim() || null
    if (input.price !== undefined) updateData.price = input.price
    if (input.previousPrice !== undefined) updateData.previous_price = input.previousPrice
    if (input.stock !== undefined) updateData.stock = input.stock
    if (input.deliveryInfo !== undefined) updateData.delivery_info = input.deliveryInfo?.trim() || null
    if (input.paymentInfo !== undefined) updateData.payment_info = input.paymentInfo?.trim() || null
    if (input.status !== undefined) updateData.status = input.status

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single()

    if (error) {
      if (error.code === '23505' && error.message.includes('slug')) {
        return { product: null, error: 'Ya tienes un producto con esta URL. Elige otra.' }
      }
      return { product: null, error: error.message }
    }

    return { product: mapProduct(data), error: null }
  },

  /**
   * Eliminar producto (soft delete).
   */
  async deleteProduct(productId: string): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('products')
      .update({ status: 'deleted' })
      .eq('id', productId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  /**
   * Cambiar estado de un producto (active/inactive).
   */
  async toggleProductStatus(productId: string, currentStatus: string): Promise<{ error: string | null }> {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

    const { error } = await supabase
      .from('products')
      .update({ status: newStatus })
      .eq('id', productId)

    if (error) {
      return { error: error.message }
    }

    return { error: null }
  },

  /**
   * Verificar si un slug de producto está disponible dentro del negocio.
   */
  async isSlugAvailable(businessId: string, slug: string, excludeProductId?: string): Promise<boolean> {
    let query = supabase
      .from('products')
      .select('id')
      .eq('business_id', businessId)
      .eq('slug', slug)
      .neq('status', 'deleted')

    if (excludeProductId) {
      query = query.neq('id', excludeProductId)
    }

    const { data } = await query.maybeSingle()
    return data === null
  },
}

// ============================================
// MAPPER: snake_case → camelCase
// ============================================

function mapProduct(data: Record<string, unknown>): Product {
  const images = (data.product_images as Record<string, unknown>[] | undefined) || []

  return {
    id: data.id as string,
    businessId: data.business_id as string,
    name: data.name as string,
    slug: data.slug as string,
    description: (data.description as string) || null,
    benefits: (data.benefits as string) || null,
    price: Number(data.price),
    previousPrice: data.previous_price ? Number(data.previous_price) : null,
    stock: Number(data.stock),
    deliveryInfo: (data.delivery_info as string) || null,
    paymentInfo: (data.payment_info as string) || null,
    status: data.status as Product['status'],
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
    images: images.map((img) => ({
      id: img.id as string,
      productId: (img.product_id as string) || '',
      storagePath: (img.storage_path as string) || '',
      publicUrl: img.public_url as string,
      sortOrder: Number(img.sort_order || 0),
      createdAt: (img.created_at as string) || '',
    })) as ProductImage[],
  }
}
