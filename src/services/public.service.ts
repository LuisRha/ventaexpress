import { supabase } from '@/lib/supabase'
import type { ProductImage } from '@/types'

// ============================================
// SERVICIO PÚBLICO (sin autenticación)
// ============================================

export interface PublicProduct {
  id: string
  businessId: string
  businessName: string
  businessSlug: string
  businessWhatsapp: string | null
  businessLogo: string | null
  name: string
  slug: string
  description: string | null
  benefits: string | null
  price: number
  previousPrice: number | null
  deliveryInfo: string | null
  paymentInfo: string | null
  images: ProductImage[]
  showBranding: boolean
}

export const publicService = {
  /**
   * Obtener producto público por business slug + product slug.
   * Se usa desde la página pública /:businessSlug/:productSlug
   * NO requiere autenticación.
   */
  async getPublicProduct(businessSlug: string, productSlug: string): Promise<{ product: PublicProduct | null; error: string | null }> {
    // Buscar business por slug
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('id, name, slug, whatsapp_number, logo_url, plan_id')
      .eq('slug', businessSlug)
      .eq('status', 'active')
      .single()

    if (bizError || !business) {
      return { product: null, error: 'Negocio no encontrado.' }
    }

    // Buscar producto por slug dentro del negocio
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select(`
        id, business_id, name, slug, description, benefits,
        price, previous_price, delivery_info, payment_info,
        product_images (id, product_id, storage_path, public_url, sort_order)
      `)
      .eq('business_id', business.id)
      .eq('slug', productSlug)
      .eq('status', 'active')
      .single()

    if (prodError || !product) {
      return { product: null, error: 'Producto no encontrado.' }
    }

    // Verificar si el plan muestra branding
    let showBranding = true
    if (business.plan_id) {
      const { data: plan } = await supabase
        .from('plans')
        .select('features')
        .eq('id', business.plan_id)
        .single()

      if (plan?.features && typeof plan.features === 'object') {
        const features = plan.features as Record<string, boolean>
        showBranding = features.branding !== false
      }
    }

    const images = ((product.product_images as Record<string, unknown>[]) || [])
      .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
      .map((img) => ({
        id: img.id as string,
        productId: img.product_id as string,
        storagePath: img.storage_path as string,
        publicUrl: img.public_url as string,
        sortOrder: img.sort_order as number,
        createdAt: '',
      }))

    return {
      product: {
        id: product.id,
        businessId: business.id,
        businessName: business.name,
        businessSlug: business.slug,
        businessWhatsapp: business.whatsapp_number,
        businessLogo: business.logo_url,
        name: product.name,
        slug: product.slug,
        description: product.description,
        benefits: product.benefits,
        price: Number(product.price),
        previousPrice: product.previous_price ? Number(product.previous_price) : null,
        deliveryInfo: product.delivery_info,
        paymentInfo: product.payment_info,
        images,
        showBranding,
      },
      error: null,
    }
  },
}
