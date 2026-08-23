// ============================================
// TIPOS PARA LANDING DE PRODUCTO AVANZADA
// ============================================

export interface ProductFeature {
  icon: string  // emoji o nombre del ícono
  label: string
  value: string
}

export interface ProductOption {
  title: string
  description: string
  originalPrice: number
  price: number
  quantity: number
  popular?: boolean
}

export interface ProductSection {
  title: string
  subtitle?: string
  description: string
  bullets?: string[]
  imageUrl?: string
  reversed?: boolean
}

export interface ProductReview {
  name: string
  city: string
  rating: number
  text: string
  detail?: string
}

export interface ProductFAQ {
  question: string
  answer: string
}

export interface ProductColor {
  name: string
  value: string  // hex color
}

export interface TrustBadge {
  icon: string
  label: string
  sublabel: string
}

export interface ReviewsSummary {
  rating: number
  count: number
}

export interface ProductLandingData {
  // Campos básicos
  id: string
  businessId: string
  businessName: string
  businessSlug: string
  businessWhatsapp: string | null
  businessLogo: string | null
  name: string
  slug: string
  subtitle: string | null
  badgeText: string | null
  description: string | null
  benefits: string | null
  price: number
  previousPrice: number | null
  deliveryInfo: string | null
  paymentInfo: string | null
  shippingText: string | null
  images: Array<{ id: string; publicUrl: string; sortOrder: number }>
  showBranding: boolean

  // Campos avanzados
  features: ProductFeature[]
  productOptions: ProductOption[]
  sections: ProductSection[]
  reviews: ProductReview[]
  faq: ProductFAQ[]
  colors: ProductColor[]
  trustBadges: TrustBadge[]
  reviewsSummary: ReviewsSummary | null
}
