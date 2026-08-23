// ============================================
// TIPOS GLOBALES - VENTAEXPRESS
// ============================================

// --- Auth & Users ---
export type UserRole = 'seller' | 'admin'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  createdAt: string
}

// --- Business ---
export type BusinessStatus = 'active' | 'suspended' | 'deleted'

export interface Business {
  id: string
  ownerUserId: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  whatsappNumber: string | null
  status: BusinessStatus
  planId: string | null
  createdAt: string
  updatedAt: string
}

// --- Products ---
export type ProductStatus = 'active' | 'inactive' | 'deleted'

export interface Product {
  id: string
  businessId: string
  name: string
  slug: string
  description: string | null
  benefits: string | null
  price: number
  previousPrice: number | null
  stock: number
  deliveryInfo: string | null
  paymentInfo: string | null
  status: ProductStatus
  createdAt: string
  updatedAt: string
  images?: ProductImage[]
}

export interface ProductImage {
  id: string
  productId: string
  storagePath: string
  publicUrl: string
  sortOrder: number
  createdAt: string
}

// --- Customers ---
export interface Customer {
  id: string
  businessId: string
  firstName: string
  secondName: string | null
  lastName: string
  secondLastName: string | null
  phone: string
  province: string
  city: string
  address: string
  reference: string | null
  createdAt: string
  updatedAt: string
}

// --- Orders ---
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMATION_PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED'

export type PaymentMethod = 'COD' | 'TRANSFER' | 'ONLINE'

export interface Order {
  id: string
  businessId: string
  customerId: string
  orderNumber: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  subtotal: number
  shippingCost: number
  total: number
  customerNotes: string | null
  createdAt: string
  updatedAt: string
  customer?: Customer
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  total: number
  product?: Product
}

// --- Plans ---
export type BillingPeriod = 'monthly' | 'yearly'

export interface Plan {
  id: string
  name: string
  slug: string
  price: number
  currency: string
  billingPeriod: BillingPeriod
  maxProducts: number
  maxImagesPerProduct: number
  storageLimitMb: number
  features: Record<string, boolean>
  active: boolean
  createdAt: string
  updatedAt: string
}

// --- Subscriptions ---
export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'cancelled'
  | 'suspended'
  | 'expired'

export interface Subscription {
  id: string
  businessId: string
  planId: string
  provider: string | null
  providerCustomerId: string | null
  providerSubscriptionId: string | null
  status: SubscriptionStatus
  startDate: string
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
  plan?: Plan
}

// --- UI ---
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
