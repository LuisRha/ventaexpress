import { supabase } from '@/lib/supabase'
import type { ProductImage } from '@/types'
import type { ProductLandingData, ProductFeature, ProductOption, ProductSection, ProductReview, ProductFAQ, ProductColor, TrustBadge, ReviewsSummary } from '@/types/product-landing'

// Re-export for convenience
export type { ProductLandingData }

export const publicService = {
  /**
   * Obtener producto público por business slug + product slug.
   * Incluye todos los campos avanzados para la landing.
   */
  async getPublicProduct(businessSlug: string, productSlug: string): Promise<{ product: ProductLandingData | null; error: string | null }> {
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

    // Buscar producto
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select(`
        id, business_id, name, slug, subtitle, badge_text, description, benefits,
        price, previous_price, delivery_info, payment_info, shipping_text,
        features, product_options, sections, reviews, faq, colors, trust_badges, reviews_summary,
        product_images (id, product_id, storage_path, public_url, sort_order)
      `)
      .eq('business_id', business.id)
      .eq('slug', productSlug)
      .eq('status', 'active')
      .single()

    if (prodError || !product) {
      return { product: null, error: 'Producto no encontrado.' }
    }

    // Verificar branding del plan
    let showBranding = true
    if (business.plan_id) {
      const { data: plan } = await supabase
        .from('plans')
        .select('features')
        .eq('id', business.plan_id)
        .single()

      if (plan?.features && typeof plan.features === 'object') {
        const f = plan.features as Record<string, boolean>
        showBranding = f.branding !== false
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
      })) as ProductImage[]

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
        subtitle: product.subtitle || null,
        badgeText: product.badge_text || null,
        description: product.description,
        benefits: product.benefits,
        price: Number(product.price),
        previousPrice: product.previous_price ? Number(product.previous_price) : null,
        deliveryInfo: product.delivery_info,
        paymentInfo: product.payment_info,
        shippingText: product.shipping_text || null,
        images: images.map(i => ({ id: i.id, publicUrl: i.publicUrl, sortOrder: i.sortOrder })),
        showBranding,
        features: (product.features as ProductFeature[]) || [],
        productOptions: (product.product_options as ProductOption[]) || [],
        sections: (product.sections as ProductSection[]) || [],
        reviews: (product.reviews as ProductReview[]) || [],
        faq: (product.faq as ProductFAQ[]) || [],
        colors: (product.colors as ProductColor[]) || [],
        trustBadges: (product.trust_badges as TrustBadge[]) || [],
        reviewsSummary: (product.reviews_summary as ReviewsSummary) || null,
      },
      error: null,
    }
  },
}
